package com.iarts.supplier;

import java.time.Instant;

/** azaApiKey/azaWebhookSecret are never serialized back out, even to the dashboard. */
public record SupplierDto(String id, String name, String contactEmail, boolean azaConfigured, Instant createdAt) {

    public static SupplierDto from(Supplier s) {
        return new SupplierDto(
                s.getId().toString(),
                s.getName(),
                s.getContactEmail(),
                s.getAzaApiKey() != null && !s.getAzaApiKey().isBlank(),
                s.getCreatedAt()
        );
    }
}
