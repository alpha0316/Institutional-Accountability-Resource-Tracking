package com.iarts.claims;

import java.math.BigDecimal;

public record ClaimDeductionDto(String reason, BigDecimal amount) {
    public static ClaimDeductionDto from(ClaimDeduction d) {
        return new ClaimDeductionDto(d.getReason(), d.getAmount());
    }
}
