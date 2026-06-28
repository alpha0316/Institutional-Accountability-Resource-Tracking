package com.iarts.supply;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface SupplyOrderRepository extends JpaRepository<SupplyOrder, UUID> {

    /**
     * Derived for a Claim's supplyBreakdown. No unit-cost data exists on SupplyOrder yet,
     * so this intentionally returns quantity only — cost is not fabricated.
     */
    @Query("""
            SELECT s.itemType AS itemType, SUM(s.quantity) AS totalQuantity
            FROM SupplyOrder s
            WHERE s.schoolId = :schoolId AND s.orderDate >= :start AND s.orderDate <= :end
            GROUP BY s.itemType
            """)
    List<SupplyBreakdownRow> findBreakdown(@Param("schoolId") UUID schoolId, @Param("start") LocalDate start, @Param("end") LocalDate end);
}
