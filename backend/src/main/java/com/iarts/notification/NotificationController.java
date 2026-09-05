package com.iarts.notification;

import com.iarts.auth.AuthenticatedPrincipal;
import com.iarts.common.ApiException;
import com.iarts.common.ApiResponse;
import com.iarts.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;

    /** Defaults to the caller's own role — an explicit ?role= is only honored for the demo's
     *  shared-account setup where a caller may want to check another office's queue. */
    @GetMapping
    public ApiResponse<List<NotificationDto>> list(@RequestParam(required = false) UserRole role,
                                                      @AuthenticationPrincipal AuthenticatedPrincipal principal) {
        UserRole target = role != null ? role : UserRole.fromJson(principal.role());
        return ApiResponse.of(notificationRepository.findByRecipientRoleOrderByCreatedAtDesc(target)
                .stream().map(NotificationDto::from).toList());
    }

    @GetMapping("/unread-count")
    public ApiResponse<Map<String, Long>> unreadCount(@RequestParam(required = false) UserRole role,
                                                         @AuthenticationPrincipal AuthenticatedPrincipal principal) {
        UserRole target = role != null ? role : UserRole.fromJson(principal.role());
        return ApiResponse.of(Map.of("count", notificationRepository.countByRecipientRoleAndReadFalse(target)));
    }

    @PostMapping("/{id}/read")
    public ApiResponse<NotificationDto> markRead(@PathVariable UUID id) {
        Notification n = notificationRepository.findById(id).orElseThrow(() -> ApiException.notFound("Notification not found"));
        n.setRead(true);
        return ApiResponse.of(NotificationDto.from(notificationRepository.save(n)));
    }

    @PostMapping("/read-all")
    public ApiResponse<Void> markAllRead(@RequestParam(required = false) UserRole role,
                                           @AuthenticationPrincipal AuthenticatedPrincipal principal) {
        UserRole target = role != null ? role : UserRole.fromJson(principal.role());
        List<Notification> unread = notificationRepository.findByRecipientRoleOrderByCreatedAtDesc(target)
                .stream().filter(n -> !n.isRead()).toList();
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
        return ApiResponse.of(null);
    }
}
