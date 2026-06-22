package com.iarts.reimbursement;

import java.math.BigDecimal;
import java.time.Instant;

/** amountApproved is `number | null` on the frontend (always present, possibly null) — do not omit nulls here. */
public record ReimbursementClaimDto(
        String id,
        String reportId,
        String institutionName,
        BigDecimal amountClaimed,
        BigDecimal amountApproved,
        ReimbursementStatus status,
        Instant submittedAt
) {
    public static ReimbursementClaimDto from(ReimbursementClaim c) {
        return new ReimbursementClaimDto(
                c.getId().toString(),
                c.getReportId().toString(),
                c.getInstitutionName(),
                c.getAmountClaimed(),
                c.getAmountApproved(),
                c.getStatus(),
                c.getSubmittedAt()
        );
    }
}
