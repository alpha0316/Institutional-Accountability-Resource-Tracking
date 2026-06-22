package com.iarts.supply;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "supply_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SupplyOrder {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "item_type", nullable = false)
    private String itemType;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false)
    private String unit;

    @Column(name = "order_date", nullable = false)
    private LocalDate orderDate;

    @Column(name = "supplier_id", nullable = false)
    private UUID supplierId;

    @Column(name = "school_id", nullable = false)
    private UUID schoolId;

    @Column(name = "token_ref")
    private String tokenRef;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SupplyOrderStatus status;
}
