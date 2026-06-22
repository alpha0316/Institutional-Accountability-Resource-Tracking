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
 * Tracks one Aza Checkout Session created against a supplier's own merchant account
 * for a single GovernmentToken cash release (Phase 3). 1 token = 1 session, kept
 * 1:1 with a BankTransaction so PENDING -> released/rejected stays traceable.
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

    @Column(name = "bank_transaction_id", nullable = false)
    private UUID bankTransactionId;

    /** Aza's own session id (sess_...), null until the Checkout Session has been created. */
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
