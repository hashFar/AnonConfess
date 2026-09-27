package com.anonymous.confession;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationController(
            NotificationRepository notificationRepository,
            UserRepository userRepository) {

        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Notification> getNotifications(
            @RequestParam String email) {

        User user =
                userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            return List.of();
        }

        return notificationRepository
                .findByUserOrderByCreatedAtDesc(user);
    }

    @GetMapping("/unread-count")
    public long getUnreadCount(
            @RequestParam String email) {

        User user =
                userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            return 0;
        }

        return notificationRepository
                .countByUserAndReadFalse(user);
    }

    @PutMapping("/{id}/read")
    public String markAsRead(
            @PathVariable Long id,
            @RequestParam String email) {

        User user =
                userRepository.findByEmail(email).orElse(null);

        Notification notification =
                notificationRepository.findById(id).orElse(null);

        if (user == null || notification == null) {
            return "Notification not found";
        }

        if (!notification.getUser().getId().equals(user.getId())) {
            return "Unauthorized";
        }

        notification.setRead(true);
        notificationRepository.save(notification);

        return "Notification marked as read";
    }
}