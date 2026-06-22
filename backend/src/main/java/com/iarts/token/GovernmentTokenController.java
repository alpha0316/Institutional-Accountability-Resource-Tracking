package com.iarts.token;

import com.iarts.common.ApiException;
import com.iarts.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/tokens")
@RequiredArgsConstructor
public class GovernmentTokenController {

    private final GovernmentTokenRepository tokenRepository;

    @GetMapping
    public ApiResponse<List<GovernmentTokenDto>> list(@RequestParam(required = false) TokenStatus status) {
        List<GovernmentToken> tokens = status != null
                ? tokenRepository.findByStatus(status)
                : tokenRepository.findAll();
        return ApiResponse.of(tokens.stream().map(GovernmentTokenDto::from).toList());
    }

    @GetMapping("/{id}")
    public ApiResponse<GovernmentTokenDto> get(@PathVariable @NonNull UUID id) {
        GovernmentToken token = tokenRepository.findById(id).orElseThrow(() -> ApiException.notFound("Token not found"));
        return ApiResponse.of(GovernmentTokenDto.from(token));
    }

    @PostMapping
    public ApiResponse<GovernmentTokenDto> create(@Valid @RequestBody GovernmentTokenRequest req) {
        GovernmentToken token = new GovernmentToken();
        apply(token, req);
        return ApiResponse.of(GovernmentTokenDto.from(tokenRepository.save(token)), 201);
    }

    @PutMapping("/{id}")
    public ApiResponse<GovernmentTokenDto> update(@PathVariable UUID id, @Valid @RequestBody GovernmentTokenRequest req) {
        GovernmentToken token = tokenRepository.findById(id).orElseThrow(() -> ApiException.notFound("Token not found"));
        apply(token, req);
        return ApiResponse.of(GovernmentTokenDto.from(tokenRepository.save(token)));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        tokenRepository.deleteById(id);
        return ApiResponse.of(null);
    }

    private void apply(GovernmentToken token, GovernmentTokenRequest req) {
        token.setTokenCode(req.tokenCode());
        token.setSupplierId(UUID.fromString(req.supplierId()));
        token.setSupplierName(req.supplierName());
        token.setInstitutionName(req.institutionName());
        token.setValue(req.value());
        token.setIssuedDate(req.issuedDate());
        token.setExpiryDate(req.expiryDate());
        token.setStatus(req.status() != null ? req.status() : TokenStatus.PENDING);
    }
}
