package com.iarts.supply;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum SupplyOrderStatus {
    PENDING, DELIVERED, IN_TRANSIT;

    @JsonValue
    public String toJson() {
        return name().toLowerCase();
    }

    @JsonCreator
    public static SupplyOrderStatus fromJson(String value) {
        return SupplyOrderStatus.valueOf(value.toUpperCase());
    }
}
