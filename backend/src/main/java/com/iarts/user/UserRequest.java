package com.iarts.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UserRequest(
        String azaUserId,
        @NotBlank String name,
        @NotBlank @Email String email,
        @NotNull UserRole role,
        String schoolId,
        String supplierId
) {
}
