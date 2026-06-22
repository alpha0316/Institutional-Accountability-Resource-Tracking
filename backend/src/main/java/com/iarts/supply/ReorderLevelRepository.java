package com.iarts.supply;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ReorderLevelRepository extends JpaRepository<ReorderLevel, UUID> {
}
