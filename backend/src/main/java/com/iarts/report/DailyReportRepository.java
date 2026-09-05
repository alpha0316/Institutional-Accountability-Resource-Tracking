package com.iarts.report;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DailyReportRepository extends JpaRepository<DailyReport, UUID> {
    List<DailyReport> findBySchoolIdOrderByReportDateDesc(UUID schoolId);
}
