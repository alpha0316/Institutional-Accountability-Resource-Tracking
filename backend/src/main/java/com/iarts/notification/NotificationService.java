package com.iarts.notification;

import com.iarts.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

/** Single place every office-to-office (and office-to-supplier/bank) notice gets created. */
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public void notify(UserRole recipientRole, NotificationType type, String title, String message, UUID relatedId) {
        Notification n = new Notification();
        n.setRecipientRole(recipientRole);
        n.setType(type);
        n.setTitle(title);
        n.setMessage(message);
        n.setRelatedId(relatedId);
        n.setRead(false);
        notificationRepository.save(n);
    }
}
