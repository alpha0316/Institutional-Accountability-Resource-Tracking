package com.iarts.claims;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "claims")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Claim {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "claim_code", nullable = false, unique = true)
    private String claimCode;

    @Column(name = "school_id", nullable = false)
    private UUID schoolId;

    @Column(name = "school_name", nullable = false)
    private String schoolName;

    @Column(name = "semester_label", nullable = false)
    private String semesterLabel;

    @Column(name = "semester_start", nullable = false)
    private LocalDate semesterStart;

    @Column(name = "semester_end", nullable = false)
    private LocalDate semesterEnd;

    @Column(name = "verified_students", nullable = false)
    private int verifiedStudents;

    @Column(name = "claim_value", nullable = false)
    private BigDecimal claimValue;

    @Column(name = "risk_score", nullable = false)
    private int riskScore;

    @Column(name = "fraud_flags", nullable = false)
    private int fraudFlags;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClaimStage stage;

    @Column(nullable = false)
    private boolean frozen;

    @Column(nullable = false)
    private boolean rejected;

    @Column(name = "government_notes")
    private String governmentNotes;

    @Column(name = "submitted_at", nullable = false, updatable = false)
    private Instant submittedAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        submittedAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
