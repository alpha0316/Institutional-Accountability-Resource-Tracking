package com.iarts.token;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record GovernmentTokenRequest(
        @NotBlank String tokenCode,
        @NotBlank String supplierId,
        @NotBlank String supplierName,
        @NotBlank String institutionName,
        @NotNull @Positive BigDecimal value,
        @NotNull LocalDate issuedDate,
        @NotNull LocalDate expiryDate,
        TokenStatus status
) {
}
