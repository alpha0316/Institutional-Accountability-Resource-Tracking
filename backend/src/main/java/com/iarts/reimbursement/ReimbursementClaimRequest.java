package com.iarts.reimbursement;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record ReimbursementClaimRequest(
        @NotBlank String reportId,
        @NotBlank String institutionName,
        @NotNull @Positive BigDecimal amountClaimed,
        BigDecimal amountApproved,
        ReimbursementStatus status
) {
}
