package com.iarts.claims;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/** Mirrors the frontend's GovWorkflowStage exactly. */
public enum ClaimStage {
    RECEIVED, INTAKE, REGIONAL, FINANCIAL, AUDIT, BUDGET,
    TOKEN_GENERATED, SUPPLIER_REDEMPTION, BANK_SETTLEMENT, CLOSED;

    @JsonValue
    public String toJson() {
        return name().toLowerCase();
    }

    @JsonCreator
    public static ClaimStage fromJson(String value) {
        return ClaimStage.valueOf(value.toUpperCase());
    }
}
