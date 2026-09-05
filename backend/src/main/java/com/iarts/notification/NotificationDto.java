package com.iarts.notification;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record NotificationDto(
        String id,
        NotificationType type,
        String title,
        String message,
        String relatedId,
        boolean read,
        Instant createdAt
) {
    public static NotificationDto from(Notification n) {
        return new NotificationDto(
                n.getId().toString(),
                n.getType(),
                n.getTitle(),
                n.getMessage(),
                n.getRelatedId() != null ? n.getRelatedId().toString() : null,
                n.isRead(),
                n.getCreatedAt()
        );
    }
}
