package com.iarts.user;

import com.iarts.common.ApiException;
import com.iarts.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Admin-only provisioning of IARTS users. This is how an Aza identity gets an IARTS role —
 * IARTS is a closed institutional system, not self-service signup.
 */
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping
    public ApiResponse<List<UserDto>> list() {
        return ApiResponse.of(userRepository.findAll().stream().map(UserDto::from).toList());
    }

    @GetMapping("/{id}")
    public ApiResponse<UserDto> get(@PathVariable UUID id) {
        User user = userRepository.findById(id).orElseThrow(() -> ApiException.notFound("User not found"));
        return ApiResponse.of(UserDto.from(user));
    }

    @PostMapping
    public ApiResponse<UserDto> create(@Valid @RequestBody UserRequest req) {
        User user = new User();
        apply(user, req);
        User saved = userRepository.save(user);
        return ApiResponse.of(UserDto.from(saved), 201);
    }

    @PutMapping("/{id}")
    public ApiResponse<UserDto> update(@PathVariable UUID id, @Valid @RequestBody UserRequest req) {
        User user = userRepository.findById(id).orElseThrow(() -> ApiException.notFound("User not found"));
        apply(user, req);
        return ApiResponse.of(UserDto.from(userRepository.save(user)));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        userRepository.deleteById(id);
        return ApiResponse.of(null);
    }

    private void apply(User user, UserRequest req) {
        user.setAzaUserId(req.azaUserId());
        user.setName(req.name());
        user.setEmail(req.email());
        user.setRole(req.role());
        user.setSchoolId(req.schoolId() != null ? UUID.fromString(req.schoolId()) : null);
        user.setSupplierId(req.supplierId() != null ? UUID.fromString(req.supplierId()) : null);
    }
}
