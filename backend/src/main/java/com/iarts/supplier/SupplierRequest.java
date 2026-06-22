package com.iarts.supplier;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record SupplierRequest(
        @NotBlank String name,
        @NotBlank @Email String contactEmail,
        String azaApiKey,
        String azaWebhookSecret
) {
}
