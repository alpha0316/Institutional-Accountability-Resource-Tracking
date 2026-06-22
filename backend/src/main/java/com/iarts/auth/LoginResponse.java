package com.iarts.auth;

import com.iarts.user.UserDto;

public record LoginResponse(UserDto user, String token) {
}
