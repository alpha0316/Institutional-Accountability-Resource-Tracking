package com.iarts.auth;

public record AuthenticatedPrincipal(String userId, String role, String schoolId, String supplierId) {
}
