package com.iarts.user;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record UserDto(String id, String name, String email, UserRole role, String schoolId, String supplierId) {

    public static UserDto from(User u) {
        return new UserDto(
                u.getId().toString(),
                u.getName(),
                u.getEmail(),
                u.getRole(),
                u.getSchoolId() != null ? u.getSchoolId().toString() : null,
                u.getSupplierId() != null ? u.getSupplierId().toString() : null
        );
    }
}
