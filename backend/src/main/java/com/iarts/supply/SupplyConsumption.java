package com.iarts.supply;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/** A school logging how much of a delivered supply it actually used — feeds Daily Reports. */
@Entity
@Table(name = "supply_consumptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SupplyConsumption {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "school_id", nullable = false)
    private UUID schoolId;

    @Column(name = "item_type", nullable = false)
    private String itemType;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false)
    private String unit;

    @Column(name = "meal_session", nullable = false)
    private String mealSession;

    @Column(name = "students_served", nullable = false)
    private int studentsServed;

    @Column(name = "consumed_at", nullable = false)
    private Instant consumedAt;

    @PrePersist
    void onCreate() {
        if (consumedAt == null) consumedAt = Instant.now();
    }
}
