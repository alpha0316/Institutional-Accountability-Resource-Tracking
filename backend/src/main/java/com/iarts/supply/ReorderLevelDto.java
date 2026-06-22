package com.iarts.supply;

public record ReorderLevelDto(String id, String itemType, String unit, int currentStock, int minStock, ReorderStatus status) {
    public static ReorderLevelDto from(ReorderLevel r) {
        return new ReorderLevelDto(r.getId().toString(), r.getItemType(), r.getUnit(), r.getCurrentStock(), r.getMinStock(), r.getStatus());
    }
}
