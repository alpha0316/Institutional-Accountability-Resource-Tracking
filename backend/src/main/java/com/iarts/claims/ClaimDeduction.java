package com.iarts.claims;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "claim_deductions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ClaimDeduction {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "claim_id", nullable = false)
    private UUID claimId;

    @Column(nullable = false)
    private String reason;

    @Column(nullable = false)
    private BigDecimal amount;
}
