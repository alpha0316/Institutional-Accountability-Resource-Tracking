package com.iarts.payment;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "bank_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BankTransaction {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "token_id", nullable = false)
    private UUID tokenId;

    @Column(name = "token_code", nullable = false)
    private String tokenCode;

    @Column(name = "supplier_name", nullable = false)
    private String supplierName;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(name = "processed_at")
    private Instant processedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BankTransactionStatus status;
}
