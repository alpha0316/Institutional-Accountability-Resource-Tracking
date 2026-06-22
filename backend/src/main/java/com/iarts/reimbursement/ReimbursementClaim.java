package com.iarts.reimbursement;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "reimbursement_claims")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReimbursementClaim {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "report_id", nullable = false)
    private UUID reportId;

    @Column(name = "institution_name", nullable = false)
    private String institutionName;

    @Column(name = "amount_claimed", nullable = false)
    private BigDecimal amountClaimed;

    @Column(name = "amount_approved")
    private BigDecimal amountApproved;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReimbursementStatus status;

    @Column(name = "submitted_at", nullable = false, updatable = false)
    private Instant submittedAt;

    @PrePersist
    void onCreate() {
        submittedAt = Instant.now();
    }
}
