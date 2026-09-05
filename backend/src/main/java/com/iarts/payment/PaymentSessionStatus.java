package com.iarts.payment;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/** Mirrors Aza's real merchant payout lifecycle (PENDING/PROCESSING/COMPLETED/FAILED) — see
 *  https://www.aza.systems/developers/guides?doc=payouts. This project simulates the process
 *  and status changes locally rather than calling the real Aza payout API. */
public enum PaymentSessionStatus {
    PENDING, PROCESSING, COMPLETED, FAILED;

    @JsonValue
    public String toJson() {
        return name().toLowerCase();
    }

    @JsonCreator
    public static PaymentSessionStatus fromJson(String value) {
        return PaymentSessionStatus.valueOf(value.toUpperCase());
    }
}
