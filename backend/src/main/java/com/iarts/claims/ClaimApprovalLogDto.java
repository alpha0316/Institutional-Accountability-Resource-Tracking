package com.iarts.claims;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ClaimApprovalLogDto(Instant createdAt, String action, String actor, String notes) {
    public static ClaimApprovalLogDto from(ClaimApprovalLog l) {
        return new ClaimApprovalLogDto(l.getCreatedAt(), l.getAction(), l.getActor(), l.getNotes());
    }
}
