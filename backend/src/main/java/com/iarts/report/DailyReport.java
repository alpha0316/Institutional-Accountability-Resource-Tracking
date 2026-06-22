package com.iarts.report;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "daily_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DailyReport {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "school_id", nullable = false)
    private UUID schoolId;

    @Column(name = "school_name", nullable = false)
    private String schoolName;

    @Column(name = "report_date", nullable = false)
    private LocalDate reportDate;

    @Column(name = "meals_served", nullable = false)
    private int mealsServed;

    @Column(name = "enrolled_count", nullable = false)
    private int enrolledCount;

    @Column(name = "fraud_flags", nullable = false)
    private int fraudFlags;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportStatus status;
}
