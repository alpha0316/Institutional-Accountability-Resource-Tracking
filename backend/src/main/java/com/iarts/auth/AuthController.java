package com.iarts.auth;

import com.iarts.common.ApiResponse;
import com.iarts.user.User;
import com.iarts.user.UserDto;
import com.iarts.user.UserRepository;
import com.iarts.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Phase 1 stand-in for Aza QR login: mints a real IARTS JWT for a given role so every
 * portal can be wired against real persistence before Aza OAuth exists (Phase 2).
 * Active only under the "dev" profile — remove or keep profile-guarded once QR login ships.
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Profile("dev")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    @PostMapping("/dev-login")
    public ApiResponse<LoginResponse> devLogin(@RequestParam UserRole role) {
        User user = userRepository.findAll().stream()
                .filter(u -> u.getRole() == role)
                .findFirst()
                .orElseGet(() -> seedDevUser(role));
        String token = jwtService.issue(user);
        return ApiResponse.of(new LoginResponse(UserDto.from(user), token));
    }

    private User seedDevUser(UserRole role) {
        User user = new User();
        user.setName("Dev " + role.toJson());
        user.setEmail("dev-" + role.toJson() + "@iarts.local");
        user.setRole(role);
        return userRepository.save(user);
    }
}
