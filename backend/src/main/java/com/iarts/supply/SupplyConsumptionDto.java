package com.iarts.supply;

import java.time.Instant;

public record SupplyConsumptionDto(
        String id,
        String schoolId,
        String itemType,
        int quantity,
        String unit,
        String mealSession,
        int studentsServed,
        Instant consumedAt
) {
    public static SupplyConsumptionDto from(SupplyConsumption c) {
        return new SupplyConsumptionDto(
                c.getId().toString(),
                c.getSchoolId().toString(),
                c.getItemType(),
                c.getQuantity(),
                c.getUnit(),
                c.getMealSession(),
                c.getStudentsServed(),
                c.getConsumedAt()
        );
    }
}
