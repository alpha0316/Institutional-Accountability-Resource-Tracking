package com.iarts.token;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "government_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GovernmentToken {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "token_code", nullable = false, unique = true)
    private String tokenCode;

    @Column(name = "supplier_id", nullable = false)
    private UUID supplierId;

    /** Denormalized snapshot of the supplier name at issue time, so the token ledger stays readable even if the supplier record changes. */
    @Column(name = "supplier_name", nullable = false)
    private String supplierName;

    @Column(name = "institution_name", nullable = false)
    private String institutionName;

    @Column(nullable = false)
    private BigDecimal value;

    @Column(name = "issued_date", nullable = false)
    private LocalDate issuedDate;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TokenStatus status;
}
