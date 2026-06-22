package com.iarts.token;

import java.math.BigDecimal;
import java.time.LocalDate;

public record GovernmentTokenDto(
        String id,
        String tokenCode,
        String supplierId,
        String supplierName,
        String institutionName,
        BigDecimal value,
        LocalDate issuedDate,
        LocalDate expiryDate,
        TokenStatus status
) {
    public static GovernmentTokenDto from(GovernmentToken t) {
        return new GovernmentTokenDto(
                t.getId().toString(),
                t.getTokenCode(),
                t.getSupplierId().toString(),
                t.getSupplierName(),
                t.getInstitutionName(),
                t.getValue(),
                t.getIssuedDate(),
                t.getExpiryDate(),
                t.getStatus()
        );
    }
}
