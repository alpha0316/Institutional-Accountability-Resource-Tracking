package com.iarts.supply;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "reorder_levels")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReorderLevel {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "item_type", nullable = false, unique = true)
    private String itemType;

    @Column(nullable = false)
    private String unit;

    @Column(name = "current_stock", nullable = false)
    private int currentStock;

    @Column(name = "min_stock", nullable = false)
    private int minStock;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReorderStatus status;
}
