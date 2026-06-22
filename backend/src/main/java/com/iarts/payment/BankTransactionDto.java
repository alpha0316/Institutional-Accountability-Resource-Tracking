package com.iarts.payment;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;
import java.time.Instant;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record BankTransactionDto(
        String id,
        String tokenId,
        String tokenCode,
        String supplierName,
        BigDecimal amount,
        Instant processedAt,
        BankTransactionStatus status
) {
    public static BankTransactionDto from(BankTransaction t) {
        return new BankTransactionDto(
                t.getId().toString(),
                t.getTokenId().toString(),
                t.getTokenCode(),
                t.getSupplierName(),
                t.getAmount(),
                t.getProcessedAt(),
                t.getStatus()
        );
    }
}
