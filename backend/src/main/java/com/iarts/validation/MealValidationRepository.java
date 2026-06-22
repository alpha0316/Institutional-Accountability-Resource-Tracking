package com.iarts.validation;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface MealValidationRepository extends JpaRepository<MealValidation, UUID> {
    boolean existsByCardNumberAndDiningHallIdAndServedTrueAndScanTimeAfter(
            String cardNumber, String diningHallId, Instant since);

    List<MealValidation> findAllByOrderByScanTimeDesc();
}
