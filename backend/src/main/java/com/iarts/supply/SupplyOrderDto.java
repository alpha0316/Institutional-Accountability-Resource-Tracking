package com.iarts.supply;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDate;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record SupplyOrderDto(
        String id,
        String itemType,
        int quantity,
        String unit,
        LocalDate orderDate,
        String supplierId,
        String schoolId,
        String tokenRef,
        Integer receivedQuantity,
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
                o.getReceivedQuantity(),
                o.getStatus()
        );
    }
}
