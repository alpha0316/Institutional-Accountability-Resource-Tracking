package com.iarts.payment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PaymentSessionRepository extends JpaRepository<PaymentSession, UUID> {
    Optional<PaymentSession> findByAzaSessionId(String azaSessionId);
}
