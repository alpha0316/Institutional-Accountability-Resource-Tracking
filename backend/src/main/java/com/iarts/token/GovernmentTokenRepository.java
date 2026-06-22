package com.iarts.token;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface GovernmentTokenRepository extends JpaRepository<GovernmentToken, UUID> {
    List<GovernmentToken> findByStatus(TokenStatus status);

    List<GovernmentToken> findBySupplierId(UUID supplierId);
}
