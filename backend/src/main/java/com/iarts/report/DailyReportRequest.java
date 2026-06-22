package com.iarts.report;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.time.LocalDate;

public record DailyReportRequest(
        @NotBlank String schoolId,
        @NotBlank String schoolName,
        @NotNull LocalDate reportDate,
        @PositiveOrZero int mealsServed,
        @PositiveOrZero int enrolledCount,
        @PositiveOrZero int fraudFlags,
        ReportStatus status
) {
}
