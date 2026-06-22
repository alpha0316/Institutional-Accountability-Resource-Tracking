package com.iarts.student;

import jakarta.validation.constraints.NotBlank;

public record CardRequest(@NotBlank String studentId, @NotBlank String cardNumber, @NotBlank String qrCode, boolean isActive) {
}
