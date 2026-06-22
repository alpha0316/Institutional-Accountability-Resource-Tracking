package com.iarts.supply;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SupplyOrderRepository extends JpaRepository<SupplyOrder, UUID> {
}
