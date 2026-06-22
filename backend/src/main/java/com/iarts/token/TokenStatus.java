package com.iarts.token;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum TokenStatus {
    ACTIVE, REDEEMED, EXPIRED, REJECTED, PENDING;

    @JsonValue
    public String toJson() {
        return name().toLowerCase();
    }

    @JsonCreator
    public static TokenStatus fromJson(String value) {
        return TokenStatus.valueOf(value.toUpperCase());
    }
}
