package com.iarts.common;

public record ErrorResponse(String error, String message, int status) {
}
