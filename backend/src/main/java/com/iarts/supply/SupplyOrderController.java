package com.iarts.supply;

import com.iarts.common.ApiException;
import com.iarts.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/supply-orders")
@RequiredArgsConstructor
public class SupplyOrderController {

    private final SupplyOrderRepository supplyOrderRepository;

    @GetMapping
    public ApiResponse<List<SupplyOrderDto>> list() {
        return ApiResponse.of(supplyOrderRepository.findAll().stream().map(SupplyOrderDto::from).toList());
    }

    @GetMapping("/{id}")
    public ApiResponse<SupplyOrderDto> get(@PathVariable UUID id) {
        SupplyOrder order = supplyOrderRepository.findById(id).orElseThrow(() -> ApiException.notFound("Supply order not found"));
        return ApiResponse.of(SupplyOrderDto.from(order));
    }

    @PostMapping
    public ApiResponse<SupplyOrderDto> create(@Valid @RequestBody SupplyOrderRequest req) {
        SupplyOrder order = new SupplyOrder();
        apply(order, req);
        return ApiResponse.of(SupplyOrderDto.from(supplyOrderRepository.save(order)), 201);
    }

    @PutMapping("/{id}")
    public ApiResponse<SupplyOrderDto> update(@PathVariable UUID id, @Valid @RequestBody SupplyOrderRequest req) {
        SupplyOrder order = supplyOrderRepository.findById(id).orElseThrow(() -> ApiException.notFound("Supply order not found"));
        apply(order, req);
        return ApiResponse.of(SupplyOrderDto.from(supplyOrderRepository.save(order)));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        supplyOrderRepository.deleteById(id);
        return ApiResponse.of(null);
    }

    private void apply(SupplyOrder order, SupplyOrderRequest req) {
        order.setItemType(req.itemType());
        order.setQuantity(req.quantity());
        order.setUnit(req.unit());
        order.setOrderDate(req.orderDate());
        order.setSupplierId(UUID.fromString(req.supplierId()));
        order.setSchoolId(UUID.fromString(req.schoolId()));
        order.setTokenRef(req.tokenRef());
        order.setStatus(req.status() != null ? req.status() : SupplyOrderStatus.PENDING);
    }
}
