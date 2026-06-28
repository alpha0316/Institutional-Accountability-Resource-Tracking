package com.iarts.claims;

import java.math.BigDecimal;
import java.time.Instant;

public record ClaimDto(
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
        Instant submittedAt,
        Instant updatedAt
) {
    public static ClaimDto from(Claim c) {
        return new ClaimDto(
                c.getId().toString(),
                c.getClaimCode(),
                c.getSchoolId().toString(),
                c.getSchoolName(),
                c.getSemesterLabel(),
                c.getVerifiedStudents(),
                c.getClaimValue(),
                c.getRiskScore(),
                c.getFraudFlags(),
                c.getStage(),
                c.isFrozen(),
                c.isRejected(),
                c.getSubmittedAt(),
                c.getUpdatedAt()
        );
    }
}
