package com.iarts.validation;

/** Projection for Claim attendanceHistory — derived from real scans, not stored. */
public interface MonthlyAttendanceRow {
    String getMonth();

    Long getMeals();

    Long getEligible();
}
