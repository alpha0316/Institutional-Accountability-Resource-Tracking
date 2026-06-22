package com.iarts.student;

import java.time.Instant;

public record StudentDto(
        String id,
        String uniqueCode,
        String fullName,
        EnrollmentStatus enrollmentStatus,
        String schoolId,
        int year,
        String department,
        Instant createdAt
) {
    public static StudentDto from(Student s) {
        return new StudentDto(
                s.getId().toString(),
                s.getUniqueCode(),
                s.getFullName(),
                s.getEnrollmentStatus(),
                s.getSchoolId().toString(),
                s.getYear(),
                s.getDepartment(),
                s.getCreatedAt()
        );
    }
}
