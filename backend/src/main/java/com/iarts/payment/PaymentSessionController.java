package com.iarts.payment;

import com.iarts.auth.AuthenticatedPrincipal;
import com.iarts.common.ApiException;
import com.iarts.common.ApiResponse;
import com.iarts.notification.NotificationService;
import com.iarts.notification.NotificationType;
import com.iarts.token.GovernmentToken;
import com.iarts.token.GovernmentTokenRepository;
import com.iarts.token.TokenStatus;
import com.iarts.user.UserRole;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Simulates the "Supplier submits a Government Token to the Bank -> Bank validates -> Bank
 * releases cash" loop using a local status machine shaped after Aza's real merchant payout API
 * (PENDING -> PROCESSING -> COMPLETED/FAILED, see PaymentSessionStatus) — no real money moves
 * and no external Aza call is made. Built for the FYP defense/presentation: the process and
 * status changes are real (real Postgres rows, real role-gated transitions); the money is not.
 */
@RestController
@RequestMapping("/payment-sessions")
@RequiredArgsConstructor
public class PaymentSessionController {

    private final PaymentSessionRepository paymentSessionRepository;
    private final GovernmentTokenRepository governmentTokenRepository;
    private final BankTransactionRepository bankTransactionRepository;
    private final NotificationService notificationService;

    @GetMapping
    public ApiResponse<List<PaymentSessionDto>> list(@RequestParam(required = false) UUID supplierId,
                                                        @RequestParam(required = false) PaymentSessionStatus status) {
        List<PaymentSession> sessions = supplierId != null ? paymentSessionRepository.findBySupplierId(supplierId)
                : status != null ? paymentSessionRepository.findByStatus(status)
                : paymentSessionRepository.findAll();
        return ApiResponse.of(sessions.stream().map(this::toDto).toList());
    }

    /** Supplier submits one of their own active tokens for payout. */
    @PostMapping
    public ApiResponse<PaymentSessionDto> submit(@Valid @RequestBody PaymentSessionRequest req,
                                                   @AuthenticationPrincipal AuthenticatedPrincipal principal) {
        if (principal == null || principal.supplierId() == null) {
            throw ApiException.forbidden("NOT_A_SUPPLIER", "Only a supplier account can submit a token for payout");
        }
        UUID tokenId = UUID.fromString(req.governmentTokenId());
        GovernmentToken token = governmentTokenRepository.findById(tokenId)
                .orElseThrow(() -> ApiException.notFound("Token not found"));
        if (!token.getSupplierId().toString().equals(principal.supplierId())) {
            throw ApiException.forbidden("NOT_YOUR_TOKEN", "This token was not issued to your supplier account");
        }
        if (token.getStatus() != TokenStatus.ACTIVE) {
            throw ApiException.badRequest("Token is not active");
        }
        boolean alreadySubmitted = paymentSessionRepository.findByGovTokenId(tokenId).stream()
                .anyMatch(s -> s.getStatus() == PaymentSessionStatus.PENDING || s.getStatus() == PaymentSessionStatus.PROCESSING);
        if (alreadySubmitted) {
            throw ApiException.badRequest("This token has already been submitted and is awaiting a bank decision");
        }

        PaymentSession session = new PaymentSession();
        session.setGovTokenId(tokenId);
        session.setSupplierId(UUID.fromString(principal.supplierId()));
        session.setAmount(token.getValue());
        session.setStatus(PaymentSessionStatus.PENDING);
        session.setReference("PAY-" + token.getTokenCode());
        session.setAzaSessionId("sim_" + UUID.randomUUID());
        session = paymentSessionRepository.save(session);
        notificationService.notify(UserRole.BANK, NotificationType.PAYMENT_SUBMITTED,
                "New payout submission", token.getSupplierName() + " submitted " + token.getTokenCode()
                        + " (GHS " + session.getAmount() + ") for validation.", session.getId());
        return ApiResponse.of(toDto(session), 201);
    }

    /** Bank validates a pending submission before cash can be released. */
    @PostMapping("/{id}/validate")
    public ApiResponse<PaymentSessionDto> validate(@PathVariable UUID id, @AuthenticationPrincipal AuthenticatedPrincipal principal) {
        requireBank(principal);
        PaymentSession session = load(id);
        if (session.getStatus() != PaymentSessionStatus.PENDING) {
            throw ApiException.badRequest("Only a pending session can be validated");
        }
        session.setStatus(PaymentSessionStatus.PROCESSING);
        paymentSessionRepository.save(session);
        PaymentSessionDto dto = toDto(session);
        notificationService.notify(UserRole.SUPPLIER, NotificationType.PAYMENT_VALIDATED,
                "Submission validated", dto.tokenCode() + " has been validated by the bank and is awaiting cash release.",
                session.getId());
        return ApiResponse.of(dto);
    }

    /** Bank releases cash for a validated session — creates the settlement BankTransaction and redeems the token. */
    @PostMapping("/{id}/release")
    public ApiResponse<PaymentSessionDto> release(@PathVariable UUID id, @AuthenticationPrincipal AuthenticatedPrincipal principal) {
        requireBank(principal);
        PaymentSession session = load(id);
        if (session.getStatus() != PaymentSessionStatus.PROCESSING) {
            throw ApiException.badRequest("Only a validated (processing) session can have cash released");
        }
        GovernmentToken token = governmentTokenRepository.findById(session.getGovTokenId())
                .orElseThrow(() -> ApiException.notFound("Token not found"));

        BankTransaction tx = new BankTransaction();
        tx.setTokenId(token.getId());
        tx.setTokenCode(token.getTokenCode());
        tx.setSupplierName(token.getSupplierName());
        tx.setAmount(session.getAmount());
        tx.setProcessedAt(Instant.now());
        tx.setStatus(BankTransactionStatus.RELEASED);
        tx = bankTransactionRepository.save(tx);

        token.setStatus(TokenStatus.REDEEMED);
        governmentTokenRepository.save(token);

        session.setStatus(PaymentSessionStatus.COMPLETED);
        session.setBankTransactionId(tx.getId());
        session.setCompletedAt(Instant.now());
        paymentSessionRepository.save(session);
        notificationService.notify(UserRole.SUPPLIER, NotificationType.PAYMENT_RELEASED,
                "Payout successful", "GHS " + session.getAmount() + " for " + token.getTokenCode()
                        + " was released to your account via Aza. Reference: " + session.getAzaSessionId() + ".",
                session.getId());
        return ApiResponse.of(toDto(session));
    }

    /** Bank rejects a pending or validated session — token stays active so the supplier can resubmit. */
    @PostMapping("/{id}/reject")
    public ApiResponse<PaymentSessionDto> reject(@PathVariable UUID id,
                                                   @RequestBody(required = false) PaymentSessionRejectRequest req,
                                                   @AuthenticationPrincipal AuthenticatedPrincipal principal) {
        requireBank(principal);
        PaymentSession session = load(id);
        if (session.getStatus() != PaymentSessionStatus.PENDING && session.getStatus() != PaymentSessionStatus.PROCESSING) {
            throw ApiException.badRequest("Only a pending or processing session can be rejected");
        }
        GovernmentToken token = governmentTokenRepository.findById(session.getGovTokenId())
                .orElseThrow(() -> ApiException.notFound("Token not found"));

        BankTransaction tx = new BankTransaction();
        tx.setTokenId(token.getId());
        tx.setTokenCode(token.getTokenCode());
        tx.setSupplierName(token.getSupplierName());
        tx.setAmount(session.getAmount());
        tx.setProcessedAt(Instant.now());
        tx.setStatus(BankTransactionStatus.REJECTED);
        tx.setReason(req != null ? req.reason() : null);
        tx = bankTransactionRepository.save(tx);

        session.setStatus(PaymentSessionStatus.FAILED);
        session.setBankTransactionId(tx.getId());
        session.setCompletedAt(Instant.now());
        paymentSessionRepository.save(session);
        notificationService.notify(UserRole.SUPPLIER, NotificationType.PAYMENT_REJECTED,
                "Payout rejected", token.getTokenCode() + " was rejected by the bank"
                        + (req != null && req.reason() != null ? ": " + req.reason() : ".") + " You may resubmit it.",
                session.getId());
        return ApiResponse.of(toDto(session));
    }

    private void requireBank(AuthenticatedPrincipal principal) {
        if (principal == null || UserRole.fromJson(principal.role()) != UserRole.BANK) {
            throw ApiException.forbidden("NOT_BANK", "Only a bank account can perform this action");
        }
    }

    private PaymentSession load(UUID id) {
        return paymentSessionRepository.findById(id).orElseThrow(() -> ApiException.notFound("Payment session not found"));
    }

    private PaymentSessionDto toDto(PaymentSession session) {
        GovernmentToken token = governmentTokenRepository.findById(session.getGovTokenId()).orElse(null);
        return PaymentSessionDto.from(session, token);
    }
}
