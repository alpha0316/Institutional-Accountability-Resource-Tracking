package com.iarts.supplier;

import com.iarts.common.ApiException;
import com.iarts.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierRepository supplierRepository;

    @GetMapping
    public ApiResponse<List<SupplierDto>> list() {
        return ApiResponse.of(supplierRepository.findAll().stream().map(SupplierDto::from).toList());
    }

    @GetMapping("/{id}")
    public ApiResponse<SupplierDto> get(@PathVariable UUID id) {
        Supplier supplier = supplierRepository.findById(id).orElseThrow(() -> ApiException.notFound("Supplier not found"));
        return ApiResponse.of(SupplierDto.from(supplier));
    }

    @PostMapping
    public ApiResponse<SupplierDto> create(@Valid @RequestBody SupplierRequest req) {
        Supplier supplier = new Supplier();
        apply(supplier, req);
        return ApiResponse.of(SupplierDto.from(supplierRepository.save(supplier)), 201);
    }

    @PutMapping("/{id}")
    public ApiResponse<SupplierDto> update(@PathVariable UUID id, @Valid @RequestBody SupplierRequest req) {
        Supplier supplier = supplierRepository.findById(id).orElseThrow(() -> ApiException.notFound("Supplier not found"));
        apply(supplier, req);
        return ApiResponse.of(SupplierDto.from(supplierRepository.save(supplier)));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        supplierRepository.deleteById(id);
        return ApiResponse.of(null);
    }

    private void apply(Supplier supplier, SupplierRequest req) {
        supplier.setName(req.name());
        supplier.setContactEmail(req.contactEmail());
        if (req.azaApiKey() != null) supplier.setAzaApiKey(req.azaApiKey());
        if (req.azaWebhookSecret() != null) supplier.setAzaWebhookSecret(req.azaWebhookSecret());
    }
}
