package com.iarts.payment;

import jakarta.validation.constraints.NotBlank;

public record PaymentSessionRequest(@NotBlank String governmentTokenId) {
}
