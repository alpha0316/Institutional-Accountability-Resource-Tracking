package com.iarts.payment;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum BankTransactionStatus {
    RELEASED, REJECTED, PENDING;

    @JsonValue
    public String toJson() {
        return name().toLowerCase();
    }

    @JsonCreator
    public static BankTransactionStatus fromJson(String value) {
        return BankTransactionStatus.valueOf(value.toUpperCase());
    }
}
