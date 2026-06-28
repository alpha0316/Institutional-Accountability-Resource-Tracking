package com.iarts.claims;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/** Append-only audit trail — the actual accountability mechanism for the claims workflow. */
@Entity
@Table(name = "claim_approval_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ClaimApprovalLog {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "claim_id", nullable = false)
    private UUID claimId;

    @Column(nullable = false)
    private String action;

    @Column(nullable = false)
    private String actor;

    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }
}
