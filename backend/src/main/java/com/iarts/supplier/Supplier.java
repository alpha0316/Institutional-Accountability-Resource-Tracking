package com.iarts.supplier;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "suppliers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Supplier {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String contactEmail;

    /** Supplier's own Aza merchant API key (sk_test_/sk_live_) — added in Phase 3, plain column for now. */
    @Column(name = "aza_api_key")
    private String azaApiKey;

    /** Per-merchant webhook signing secret, used to verify X-Aza-Signature on incoming webhooks. */
    @Column(name = "aza_webhook_secret")
    private String azaWebhookSecret;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }
}
