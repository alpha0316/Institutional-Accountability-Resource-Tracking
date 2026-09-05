package com.iarts.notification;

import com.iarts.user.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByRecipientRoleOrderByCreatedAtDesc(UserRole recipientRole);
    long countByRecipientRoleAndReadFalse(UserRole recipientRole);
}
