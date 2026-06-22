package com.iarts.student;

import java.time.Instant;

public record CardDto(String id, String studentId, String cardNumber, String qrCode, boolean isActive, Instant issuedAt) {
    public static CardDto from(Card c) {
        return new CardDto(
                c.getId().toString(),
                c.getStudentId().toString(),
                c.getCardNumber(),
                c.getQrCode(),
                c.isActive(),
                c.getIssuedAt()
        );
    }
}
