package com.iarts.report;

import java.time.LocalDate;

public record DailyReportDto(
        String id,
        String schoolId,
        String schoolName,
        LocalDate reportDate,
        int mealsServed,
        int enrolledCount,
        int fraudFlags,
        ReportStatus status
) {
    public static DailyReportDto from(DailyReport r) {
        return new DailyReportDto(
                r.getId().toString(),
                r.getSchoolId().toString(),
                r.getSchoolName(),
                r.getReportDate(),
                r.getMealsServed(),
                r.getEnrolledCount(),
                r.getFraudFlags(),
                r.getStatus()
        );
    }
}
