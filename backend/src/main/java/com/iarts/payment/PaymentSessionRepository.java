package com.iarts.payment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentSessionRepository extends JpaRepository<PaymentSession, UUID> {
    Optional<PaymentSession> findByAzaSessionId(String azaSessionId);
    List<PaymentSession> findBySupplierId(UUID supplierId);
    List<PaymentSession> findByStatus(PaymentSessionStatus status);
    List<PaymentSession> findByGovTokenId(UUID govTokenId);
}
