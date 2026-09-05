package com.iarts.payment;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.iarts.token.GovernmentToken;

import java.math.BigDecimal;
import java.time.Instant;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record PaymentSessionDto(
        String id,
        String govTokenId,
        String tokenCode,
        String supplierId,
        String supplierName,
        String institutionName,
        BigDecimal amount,
        PaymentSessionStatus status,
        String reference,
        String bankTransactionId,
        Instant createdAt,
        Instant completedAt
) {
    public static PaymentSessionDto from(PaymentSession s, GovernmentToken token) {
        return new PaymentSessionDto(
                s.getId().toString(),
                s.getGovTokenId().toString(),
                token != null ? token.getTokenCode() : "—",
                s.getSupplierId().toString(),
                token != null ? token.getSupplierName() : "—",
                token != null ? token.getInstitutionName() : "—",
                s.getAmount(),
                s.getStatus(),
                s.getReference(),
                s.getBankTransactionId() != null ? s.getBankTransactionId().toString() : null,
                s.getCreatedAt(),
                s.getCompletedAt()
        );
    }
}
