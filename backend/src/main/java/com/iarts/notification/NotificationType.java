package com.iarts.notification;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum NotificationType {
    CLAIM_SUBMITTED,
    CLAIM_ADVANCED,
    CLAIM_RETURNED,
    CLAIM_REJECTED,
    CLAIM_READY_FOR_TOKEN,
    TOKEN_ISSUED,
    PAYMENT_SUBMITTED,
    PAYMENT_VALIDATED,
    PAYMENT_RELEASED,
    PAYMENT_REJECTED;

    @JsonValue
    public String toJson() {
        return name().toLowerCase();
    }

    @JsonCreator
    public static NotificationType fromJson(String value) {
        return NotificationType.valueOf(value.toUpperCase());
    }
}
