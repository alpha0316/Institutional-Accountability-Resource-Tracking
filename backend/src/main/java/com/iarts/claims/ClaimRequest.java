package com.iarts.claims;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ClaimRequest(
        @NotBlank String claimCode,
        @NotBlank String schoolId,
        @NotBlank String schoolName,
        @NotBlank String semesterLabel,
        @NotNull LocalDate semesterStart,
        @NotNull LocalDate semesterEnd,
        @Positive int verifiedStudents,
        @NotNull @Positive BigDecimal claimValue,
        int riskScore,
        int fraudFlags,
        String governmentNotes
) {
}
