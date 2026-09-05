package com.iarts.payment;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Tracks one simulated Aza merchant payout for a single GovernmentToken cash release —
 * mirrors Aza's real payout lifecycle (PENDING -> PROCESSING -> COMPLETED/FAILED, see
 * https://www.aza.systems/developers/guides?doc=payouts) without calling the real API.
 * bankTransactionId is set once the session resolves (COMPLETED or FAILED); null while PENDING/PROCESSING.
 */
@Entity
@Table(name = "payment_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentSession {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "gov_token_id", nullable = false)
    private UUID govTokenId;

    @Column(name = "supplier_id", nullable = false)
    private UUID supplierId;

    @Column(name = "bank_transaction_id")
    private UUID bankTransactionId;

    /** Simulated Aza payout reference (sim_...) — stands in for Aza's real session id. */
    @Column(name = "aza_session_id", unique = true)
    private String azaSessionId;

    @Column(nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentSessionStatus status;

    private String reference;

    @Column(name = "checkout_url")
    private String checkoutUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }
}
