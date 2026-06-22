package com.iarts.student;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CardRepository extends JpaRepository<Card, UUID> {
    Optional<Card> findByCardNumber(String cardNumber);

    Optional<Card> findByQrCode(String qrCode);

    List<Card> findByStudentId(UUID studentId);
}
