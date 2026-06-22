package com.iarts.supply;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;

public record SupplyOrderRequest(
        @NotBlank String itemType,
        @Positive int quantity,
        @NotBlank String unit,
        @NotNull LocalDate orderDate,
        @NotBlank String supplierId,
        @NotBlank String schoolId,
        String tokenRef,
        SupplyOrderStatus status
) {
}
