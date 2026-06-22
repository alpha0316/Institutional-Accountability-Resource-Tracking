package com.iarts.student;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "cards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Card {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Column(name = "card_number", nullable = false, unique = true)
    private String cardNumber;

    @Column(name = "qr_code", nullable = false, unique = true)
    private String qrCode;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    @Column(name = "issued_at", nullable = false, updatable = false)
    private Instant issuedAt;

    @PrePersist
    void onCreate() {
        issuedAt = Instant.now();
    }
}
