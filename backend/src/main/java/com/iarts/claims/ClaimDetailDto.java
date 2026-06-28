package com.iarts.claims;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ClaimDetailDto(
        String id,
        String claimCode,
        String schoolId,
        String schoolName,
        String semesterLabel,
        int verifiedStudents,
        BigDecimal claimValue,
        int riskScore,
        int fraudFlags,
        ClaimStage stage,
        boolean frozen,
        boolean rejected,
        String governmentNotes,
        Instant submittedAt,
        Instant updatedAt,
        double attendancePct,
        List<AttendanceMonthDto> attendanceHistory,
        List<SupplyItemDto> supplyBreakdown,
        List<ClaimDeductionDto> policyDeductions,
        List<ClaimDocumentDto> supportingDocs,
        List<ClaimApprovalLogDto> approvalHistory
) {
}
