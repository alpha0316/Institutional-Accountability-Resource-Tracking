package com.iarts.reimbursement;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ReimbursementStatus {
    PENDING, APPROVED, REJECTED, PARTIAL;

    @JsonValue
    public String toJson() {
        return name().toLowerCase();
    }

    @JsonCreator
    public static ReimbursementStatus fromJson(String value) {
        return ReimbursementStatus.valueOf(value.toUpperCase());
    }
}
