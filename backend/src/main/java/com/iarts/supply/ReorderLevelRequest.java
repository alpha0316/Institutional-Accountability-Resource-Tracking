package com.iarts.supply;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

public record ReorderLevelRequest(
        @NotBlank String itemType,
        @NotBlank String unit,
        @PositiveOrZero int currentStock,
        @PositiveOrZero int minStock,
        ReorderStatus status
) {
}
