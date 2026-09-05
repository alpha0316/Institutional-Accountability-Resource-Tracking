package com.iarts.validation;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record MealValidationDto(
        String id,
        String cardNumber,
        String studentName,
        String diningHallId,
        Instant scanTime,
        boolean served,
        boolean isDuplicate,
        boolean isFlagged,
        String rejectionReason
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
                m.isFlagged(),
                m.getRejectionReason()
        );
    }
}
