package com.iarts.supply;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ReorderStatus {
    OK, LOW, CRITICAL;

    @JsonValue
    public String toJson() {
        return name().toLowerCase();
    }

    @JsonCreator
    public static ReorderStatus fromJson(String value) {
        return ReorderStatus.valueOf(value.toUpperCase());
    }
}
