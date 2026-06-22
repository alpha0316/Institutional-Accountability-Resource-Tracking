package com.iarts.report;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ReportStatus {
    DRAFT, SUBMITTED, APPROVED, FLAGGED;

    @JsonValue
    public String toJson() {
        return name().toLowerCase();
    }

    @JsonCreator
    public static ReportStatus fromJson(String value) {
        return ReportStatus.valueOf(value.toUpperCase());
    }
}
