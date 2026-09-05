package com.iarts.claims;

/** Real numbers computed from live attendance data, shown to the School Admin before they submit a claim. */
public record ClaimPreviewDto(long verifiedStudents, long fraudFlags, double attendancePct) {
}
