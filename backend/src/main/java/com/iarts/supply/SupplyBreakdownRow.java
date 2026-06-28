package com.iarts.supply;

/** Projection for Claim supplyBreakdown — derived from real supply orders, not stored. */
public interface SupplyBreakdownRow {
    String getItemType();

    Integer getTotalQuantity();
}
