package com.iarts.common;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(T data, String message, int status) {

    public static <T> ApiResponse<T> of(T data) {
        return new ApiResponse<>(data, null, 200);
    }

    public static <T> ApiResponse<T> of(T data, int status) {
        return new ApiResponse<>(data, null, status);
    }
}
