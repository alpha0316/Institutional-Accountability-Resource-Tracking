package com.iarts.supply;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SupplyConsumptionRepository extends JpaRepository<SupplyConsumption, UUID> {
    List<SupplyConsumption> findBySchoolIdOrderByConsumedAtDesc(UUID schoolId);
    List<SupplyConsumption> findAllByOrderByConsumedAtDesc();
}
