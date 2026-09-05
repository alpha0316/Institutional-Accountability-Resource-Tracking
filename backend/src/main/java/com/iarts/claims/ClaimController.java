package com.iarts.claims;

import com.iarts.auth.AuthenticatedPrincipal;
import com.iarts.common.ApiException;
import com.iarts.common.ApiResponse;
import com.iarts.notification.NotificationService;
import com.iarts.notification.NotificationType;
import com.iarts.supplier.Supplier;
import com.iarts.supplier.SupplierRepository;
import com.iarts.supply.SupplyOrder;
import com.iarts.supply.SupplyOrderRepository;
import com.iarts.token.GovernmentToken;
import com.iarts.token.GovernmentTokenRepository;
import com.iarts.token.TokenStatus;
import com.iarts.user.UserRole;
import com.iarts.validation.MealValidationRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Server-side enforcement of the 3-officer claims pipeline. Each action endpoint requires
 * the caller's role to match whichever officer owns the claim's current stage — this is the
 * actual "no single officer can approve everything" rule; the frontend only displays it.
 */
@RestController
@RequestMapping("/claims")
@RequiredArgsConstructor
public class ClaimController {

    private final ClaimRepository claimRepository;
    private final ClaimApprovalLogRepository logRepository;
    private final ClaimDeductionRepository deductionRepository;
    private final ClaimDocumentRepository documentRepository;
    private final MealValidationRepository mealValidationRepository;
    private final SupplyOrderRepository supplyOrderRepository;
    private final SupplierRepository supplierRepository;
    private final GovernmentTokenRepository tokenRepository;
    private final NotificationService notificationService;

    private static final Map<ClaimStage, UserRole> STAGE_ROLE = Map.of(
            ClaimStage.REGIONAL, UserRole.REGIONAL_OFFICER,
            ClaimStage.FINANCIAL, UserRole.FINANCIAL_OFFICER,
            ClaimStage.AUDIT, UserRole.AUDIT_OFFICER
    );

    private static final Map<ClaimStage, ClaimStage> NEXT_STAGE = Map.of(
            ClaimStage.REGIONAL, ClaimStage.FINANCIAL,
            ClaimStage.FINANCIAL, ClaimStage.AUDIT,
            ClaimStage.AUDIT, ClaimStage.BUDGET
    );

    @GetMapping
    public ApiResponse<List<ClaimDto>> list(@RequestParam(required = false) ClaimStage stage) {
        List<Claim> claims = stage != null ? claimRepository.findByStage(stage) : claimRepository.findAll();
        return ApiResponse.of(claims.stream().map(ClaimDto::from).toList());
    }

    @GetMapping("/{id}")
    public ApiResponse<ClaimDetailDto> get(@PathVariable UUID id) {
        return ApiResponse.of(buildDetail(loadClaim(id)));
    }

    /** Real numbers a School Admin sees before submitting — same computation buildDetail() uses. */
    @GetMapping("/preview")
    public ApiResponse<ClaimPreviewDto> preview(@RequestParam UUID schoolId,
                                                  @RequestParam LocalDate semesterStart,
                                                  @RequestParam LocalDate semesterEnd) {
        Instant start = semesterStart.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant end = semesterEnd.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();

        var attendanceRows = mealValidationRepository.findMonthlyAttendance(schoolId, start, end);
        long verifiedStudents = attendanceRows.stream().mapToLong(r -> r.getMeals()).sum();
        long totalEligible = attendanceRows.stream().mapToLong(r -> r.getEligible()).sum();
        double attendancePct = totalEligible == 0 ? 0 : (verifiedStudents * 100.0) / totalEligible;
        long fraudFlags = mealValidationRepository.countFraudFlags(schoolId, start, end);

        return ApiResponse.of(new ClaimPreviewDto(verifiedStudents, fraudFlags, attendancePct));
    }

    /** Claims enter the pipeline directly at REGIONAL — RECEIVED/INTAKE have no modeled role yet. */
    @PostMapping
    public ApiResponse<ClaimDetailDto> create(@Valid @RequestBody ClaimRequest req) {
        Claim claim = new Claim();
        claim.setClaimCode(req.claimCode());
        claim.setSchoolId(UUID.fromString(req.schoolId()));
        claim.setSchoolName(req.schoolName());
        claim.setSemesterLabel(req.semesterLabel());
        claim.setSemesterStart(req.semesterStart());
        claim.setSemesterEnd(req.semesterEnd());
        claim.setVerifiedStudents(req.verifiedStudents());
        claim.setClaimValue(req.claimValue());
        claim.setRiskScore(req.riskScore());
        claim.setFraudFlags(req.fraudFlags());
        claim.setGovernmentNotes(req.governmentNotes());
        claim.setStage(ClaimStage.REGIONAL);
        claim = claimRepository.save(claim);
        log(claim, "Claim Submitted", null, null);
        notificationService.notify(UserRole.REGIONAL_OFFICER, NotificationType.CLAIM_SUBMITTED,
                "New claim submitted", claim.getSchoolName() + " submitted " + claim.getClaimCode()
                        + " (" + claim.getSemesterLabel() + ") for regional review.", claim.getId());
        return ApiResponse.of(buildDetail(claim));
    }

    @PostMapping("/{id}/approve")
    public ApiResponse<ClaimDetailDto> approve(@PathVariable UUID id, @AuthenticationPrincipal AuthenticatedPrincipal principal) {
        Claim claim = requireStageOwner(id, principal);
        ClaimStage from = claim.getStage();
        ClaimStage next = NEXT_STAGE.get(from);
        if (next == null) throw ApiException.badRequest("Claim cannot be advanced from stage " + from.toJson());
        claim.setStage(next);
        claimRepository.save(claim);
        log(claim, officerLabel(principal) + " Review Approved", principal, null);

        UserRole nextOwner = STAGE_ROLE.get(next);
        if (nextOwner != null) {
            notificationService.notify(nextOwner, NotificationType.CLAIM_ADVANCED,
                    "Claim ready for your review", claim.getClaimCode() + " (" + claim.getSchoolName()
                            + ") was approved by " + officerLabel(principal) + " and now awaits your review.",
                    claim.getId());
        } else {
            // Reached BUDGET — no further officer seat owns this stage yet, so the school hears back.
            notificationService.notify(UserRole.SCHOOL_ADMIN, NotificationType.CLAIM_READY_FOR_TOKEN,
                    "Claim cleared all reviews", claim.getClaimCode() + " has passed Regional, Financial, "
                            + "and Audit review, and is now awaiting a government token.", claim.getId());
            autoIssueToken(claim);
        }
        return ApiResponse.of(buildDetail(claim));
    }

    /**
     * Once a claim clears all three reviews there's no further manual step to wait on — the
     * government token that lets the supplier redeem cash is generated immediately, addressed
     * to whichever supplier already serves this school (derived from real supply order history,
     * never guessed). Schools with no supply order on file simply don't get an auto-issued token;
     * a Government officer can still issue one by hand via Issue Tokens.
     */
    private void autoIssueToken(Claim claim) {
        List<SupplyOrder> orders = supplyOrderRepository.findBySchoolId(claim.getSchoolId());
        if (orders.isEmpty()) return;
        UUID supplierId = orders.get(0).getSupplierId();
        Supplier supplier = supplierRepository.findById(supplierId).orElse(null);
        if (supplier == null) return;

        LocalDate issuedDate = LocalDate.now();
        GovernmentToken token = new GovernmentToken();
        token.setTokenCode("GOV-" + supplier.getName().replaceAll("[^A-Za-z]", "").toUpperCase()
                .substring(0, Math.min(3, supplier.getName().replaceAll("[^A-Za-z]", "").length()))
                + "-" + System.currentTimeMillis() % 1_000_000);
        token.setSupplierId(supplier.getId());
        token.setSupplierName(supplier.getName());
        token.setInstitutionName(claim.getSchoolName());
        token.setValue(claim.getClaimValue());
        token.setIssuedDate(issuedDate);
        token.setExpiryDate(issuedDate.plusMonths(6));
        token.setStatus(TokenStatus.ACTIVE);
        token = tokenRepository.save(token);

        notificationService.notify(UserRole.SUPPLIER, NotificationType.TOKEN_ISSUED,
                "New token issued", "Government issued " + token.getTokenCode() + " worth GHS "
                        + token.getValue() + " for " + token.getInstitutionName() + ".", token.getId());
    }

    @PostMapping("/{id}/return")
    public ApiResponse<ClaimDetailDto> returnToSchool(@PathVariable UUID id, @AuthenticationPrincipal AuthenticatedPrincipal principal) {
        Claim claim = requireStageOwner(id, principal);
        boolean isFinancial = claim.getStage() == ClaimStage.FINANCIAL;
        claim.setStage(ClaimStage.RECEIVED);
        claimRepository.save(claim);
        log(claim, isFinancial ? "Returned for Recalculation" : "Returned to School", principal, null);
        notificationService.notify(UserRole.SCHOOL_ADMIN, NotificationType.CLAIM_RETURNED,
                "Claim returned", claim.getClaimCode() + " was returned by " + officerLabel(principal)
                        + (isFinancial ? " for recalculation." : " to the school."), claim.getId());
        return ApiResponse.of(buildDetail(claim));
    }

    @PostMapping("/{id}/reject")
    public ApiResponse<ClaimDetailDto> reject(@PathVariable UUID id, @AuthenticationPrincipal AuthenticatedPrincipal principal) {
        Claim claim = requireStageOwner(id, principal);
        if (claim.getStage() != ClaimStage.AUDIT) throw ApiException.forbidden("NOT_AUDIT_STAGE", "Only the Audit & Risk Officer can reject a claim");
        claim.setStage(ClaimStage.CLOSED);
        claim.setRejected(true);
        claimRepository.save(claim);
        log(claim, "Rejected by Audit & Risk Officer", principal, null);
        notificationService.notify(UserRole.SCHOOL_ADMIN, NotificationType.CLAIM_REJECTED,
                "Claim rejected", claim.getClaimCode() + " was rejected by the Audit & Risk Officer.", claim.getId());
        return ApiResponse.of(buildDetail(claim));
    }

    @PostMapping("/{id}/escalate")
    public ApiResponse<ClaimDetailDto> escalate(@PathVariable UUID id, @AuthenticationPrincipal AuthenticatedPrincipal principal) {
        Claim claim = requireStageOwner(id, principal);
        log(claim, "Escalated by " + officerLabel(principal), principal, null);
        return ApiResponse.of(buildDetail(claim));
    }

    @PostMapping("/{id}/freeze")
    public ApiResponse<ClaimDetailDto> freeze(@PathVariable UUID id, @AuthenticationPrincipal AuthenticatedPrincipal principal) {
        Claim claim = requireStageOwner(id, principal);
        if (claim.getStage() != ClaimStage.AUDIT) throw ApiException.forbidden("NOT_AUDIT_STAGE", "Only the Audit & Risk Officer can freeze a claim");
        claim.setFrozen(true);
        claimRepository.save(claim);
        log(claim, "Claim Frozen", principal, null);
        return ApiResponse.of(buildDetail(claim));
    }

    private Claim loadClaim(UUID id) {
        return claimRepository.findById(id).orElseThrow(() -> ApiException.notFound("Claim not found"));
    }

    /** The core permission check: caller's role must own the stage the claim currently sits at. */
    private Claim requireStageOwner(UUID id, AuthenticatedPrincipal principal) {
        Claim claim = loadClaim(id);
        if (claim.isFrozen()) throw ApiException.badRequest("Claim is frozen");
        if (claim.isRejected() || claim.getStage() == ClaimStage.CLOSED) throw ApiException.badRequest("Claim is closed");
        UserRole requiredRole = STAGE_ROLE.get(claim.getStage());
        UserRole callerRole = UserRole.fromJson(principal.role());
        if (requiredRole == null || requiredRole != callerRole) {
            throw ApiException.forbidden("WRONG_STAGE_OWNER",
                    "This claim is at stage " + claim.getStage().toJson() + "; your role cannot act on it");
        }
        return claim;
    }

    private void log(Claim claim, String action, AuthenticatedPrincipal principal, String notes) {
        ClaimApprovalLog entry = new ClaimApprovalLog();
        entry.setClaimId(claim.getId());
        entry.setAction(action);
        entry.setActor(officerLabel(principal));
        entry.setNotes(notes);
        logRepository.save(entry);
    }

    private String officerLabel(AuthenticatedPrincipal principal) {
        if (principal == null) return "School Admin";
        String[] words = principal.role().split("_");
        StringBuilder sb = new StringBuilder();
        for (String w : words) sb.append(Character.toUpperCase(w.charAt(0))).append(w.substring(1)).append(' ');
        return sb.toString().trim();
    }

    private ClaimDetailDto buildDetail(Claim c) {
        Instant start = c.getSemesterStart().atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant end = c.getSemesterEnd().plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();

        var attendanceRows = mealValidationRepository.findMonthlyAttendance(c.getSchoolId(), start, end);
        List<AttendanceMonthDto> attendanceHistory = attendanceRows.stream()
                .map(r -> new AttendanceMonthDto(r.getMonth(), r.getMeals(), r.getEligible()))
                .toList();
        long totalMeals = attendanceRows.stream().mapToLong(r -> r.getMeals()).sum();
        long totalEligible = attendanceRows.stream().mapToLong(r -> r.getEligible()).sum();
        double attendancePct = totalEligible == 0 ? 0 : (totalMeals * 100.0) / totalEligible;

        List<SupplyItemDto> supplyBreakdown = supplyOrderRepository
                .findBreakdown(c.getSchoolId(), c.getSemesterStart(), c.getSemesterEnd())
                .stream()
                .map(r -> new SupplyItemDto(r.getItemType(), r.getTotalQuantity()))
                .toList();

        List<ClaimDeductionDto> deductions = deductionRepository.findByClaimId(c.getId())
                .stream().map(ClaimDeductionDto::from).toList();
        List<ClaimDocumentDto> docs = documentRepository.findByClaimId(c.getId())
                .stream().map(ClaimDocumentDto::from).toList();
        List<ClaimApprovalLogDto> history = logRepository.findByClaimIdOrderByCreatedAtAsc(c.getId())
                .stream().map(ClaimApprovalLogDto::from).toList();

        return new ClaimDetailDto(
                c.getId().toString(), c.getClaimCode(), c.getSchoolId().toString(), c.getSchoolName(),
                c.getSemesterLabel(), c.getVerifiedStudents(), c.getClaimValue(), c.getRiskScore(), c.getFraudFlags(),
                c.getStage(), c.isFrozen(), c.isRejected(), c.getGovernmentNotes(), c.getSubmittedAt(), c.getUpdatedAt(),
                attendancePct, attendanceHistory, supplyBreakdown, deductions, docs, history
        );
    }
}
