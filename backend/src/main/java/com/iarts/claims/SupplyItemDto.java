package com.iarts.claims;

/** Cost is intentionally omitted — SupplyOrder carries no unit-price data, so it is not fabricated. */
public record SupplyItemDto(String itemType, int totalQuantity) {
}
