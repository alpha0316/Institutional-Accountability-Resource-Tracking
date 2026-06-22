package com.iarts.validation;

import jakarta.validation.constraints.NotBlank;

public record ScanRequest(@NotBlank String qrCode, @NotBlank String diningHallId) {
}
