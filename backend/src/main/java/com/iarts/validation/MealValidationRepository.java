package com.iarts.validation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface MealValidationRepository extends JpaRepository<MealValidation, UUID> {
    boolean existsByCardNumberAndDiningHallIdAndServedTrueAndScanTimeAfter(
            String cardNumber, String diningHallId, Instant since);

    List<MealValidation> findAllByOrderByScanTimeDesc();

    /** Derived attendance for a Claim's attendanceHistory — joins through cards -> students to reach schoolId. */
    @Query(value = """
            SELECT to_char(mv.scan_time, 'Mon') AS month,
                   SUM(CASE WHEN mv.served THEN 1 ELSE 0 END) AS meals,
                   COUNT(*) AS eligible
            FROM meal_validations mv
            JOIN cards c ON c.card_number = mv.card_number
            JOIN students s ON s.id = c.student_id
            WHERE s.school_id = :schoolId
              AND mv.scan_time >= :start AND mv.scan_time < :end
            GROUP BY date_trunc('month', mv.scan_time), to_char(mv.scan_time, 'Mon')
            ORDER BY date_trunc('month', mv.scan_time)
            """, nativeQuery = true)
    List<MonthlyAttendanceRow> findMonthlyAttendance(@Param("schoolId") UUID schoolId, @Param("start") Instant start, @Param("end") Instant end);

    /** For the Submit-for-Review preview — same school/period join as findMonthlyAttendance. */
    @Query(value = """
            SELECT COUNT(*) FROM meal_validations mv
            JOIN cards c ON c.card_number = mv.card_number
            JOIN students s ON s.id = c.student_id
            WHERE s.school_id = :schoolId
              AND mv.scan_time >= :start AND mv.scan_time < :end
              AND (mv.is_duplicate = true OR mv.is_flagged = true)
            """, nativeQuery = true)
    long countFraudFlags(@Param("schoolId") UUID schoolId, @Param("start") Instant start, @Param("end") Instant end);
}
