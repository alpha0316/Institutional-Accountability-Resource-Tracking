package com.iarts.claims;

import com.iarts.auth.AuthenticatedPrincipal;
import com.iarts.common.ApiException;
import com.iarts.common.ApiResponse;
import com.iarts.supply.SupplyOrderRepository;
import com.iarts.user.UserRole;
import com.iarts.validation.MealValidationRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
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
        return ApiResponse.of(buildDetail(claim));
    }

    @PostMapping("/{id}/return")
    public ApiResponse<ClaimDetailDto> returnToSchool(@PathVariable UUID id, @AuthenticationPrincipal AuthenticatedPrincipal principal) {
        Claim claim = requireStageOwner(id, principal);
        boolean isFinancial = claim.getStage() == ClaimStage.FINANCIAL;
        claim.setStage(ClaimStage.RECEIVED);
        claimRepository.save(claim);
        log(claim, isFinancial ? "Returned for Recalculation" : "Returned to School", principal, null);
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
