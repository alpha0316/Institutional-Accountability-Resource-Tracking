package com.iarts.validation;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "meal_validations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MealValidation {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "card_number", nullable = false)
    private String cardNumber;

    @Column(name = "student_name", nullable = false)
    private String studentName;

    @Column(name = "dining_hall_id", nullable = false)
    private String diningHallId;

    @Column(name = "scan_time", nullable = false)
    private Instant scanTime;

    @Column(nullable = false)
    private boolean served;

    @Column(name = "is_duplicate", nullable = false)
    private boolean duplicate;

    @Column(name = "is_flagged", nullable = false)
    private boolean flagged;

    @PrePersist
    void onCreate() {
        scanTime = Instant.now();
    }
}
