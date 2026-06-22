package com.iarts.user;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/** Wire format is lowercase snake_case to match the frontend's UserRole union type. */
public enum UserRole {
    SCHOOL_ADMIN,
    GOVERNMENT,
    SUPPLIER,
    BANK;

    @JsonValue
    public String toJson() {
        return name().toLowerCase();
    }

    @JsonCreator
    public static UserRole fromJson(String value) {
        return UserRole.valueOf(value.toUpperCase());
    }
}
