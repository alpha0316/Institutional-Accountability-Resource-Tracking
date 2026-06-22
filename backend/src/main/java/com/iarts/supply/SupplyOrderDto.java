package com.iarts.supply;

import java.time.LocalDate;

public record SupplyOrderDto(
        String id,
        String itemType,
        int quantity,
        String unit,
        LocalDate orderDate,
        String supplierId,
        String schoolId,
        String tokenRef,
        SupplyOrderStatus status
) {
    public static SupplyOrderDto from(SupplyOrder o) {
        return new SupplyOrderDto(
                o.getId().toString(),
                o.getItemType(),
                o.getQuantity(),
                o.getUnit(),
                o.getOrderDate(),
                o.getSupplierId().toString(),
                o.getSchoolId().toString(),
                o.getTokenRef(),
                o.getStatus()
        );
    }
}
