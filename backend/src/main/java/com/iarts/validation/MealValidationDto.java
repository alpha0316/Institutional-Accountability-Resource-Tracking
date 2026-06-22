package com.iarts.validation;

import java.time.Instant;

public record MealValidationDto(
        String id,
        String cardNumber,
        String studentName,
        String diningHallId,
        Instant scanTime,
        boolean served,
        boolean isDuplicate,
        boolean isFlagged
) {
    public static MealValidationDto from(MealValidation m) {
        return new MealValidationDto(
                m.getId().toString(),
                m.getCardNumber(),
                m.getStudentName(),
                m.getDiningHallId(),
                m.getScanTime(),
                m.isServed(),
                m.isDuplicate(),
                m.isFlagged()
        );
    }
}
