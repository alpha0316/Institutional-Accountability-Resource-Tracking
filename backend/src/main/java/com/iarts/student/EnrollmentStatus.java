package com.iarts.student;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum EnrollmentStatus {
    ACTIVE, INACTIVE;

    @JsonValue
    public String toJson() {
        return name().toLowerCase();
    }

    @JsonCreator
    public static EnrollmentStatus fromJson(String value) {
        return EnrollmentStatus.valueOf(value.toUpperCase());
    }
}
