package com.iarts.supply;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

public record SupplyConsumptionRequest(
        @NotBlank String schoolId,
        @NotBlank String itemType,
        @Positive int quantity,
        @NotBlank String unit,
        @NotBlank String mealSession,
        @PositiveOrZero int studentsServed
) {
}
