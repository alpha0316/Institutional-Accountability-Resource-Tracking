package com.iarts.student;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public record StudentRequest(
        @NotBlank String uniqueCode,
        @NotBlank String fullName,
        EnrollmentStatus enrollmentStatus,
        @NotBlank String schoolId,
        @Positive int year,
        @NotBlank String department
) {
}
