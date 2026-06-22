package com.iarts.validation;

import com.fasterxml.jackson.annotation.JsonInclude;

/** Mirrors the frontend's ScanResult discriminated union: { status, studentName? }. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ScanResultResponse(String status, String studentName) {

    public static ScanResultResponse served(String studentName) {
        return new ScanResultResponse("served", studentName);
    }

    public static ScanResultResponse of(String status) {
        return new ScanResultResponse(status, null);
    }
}
