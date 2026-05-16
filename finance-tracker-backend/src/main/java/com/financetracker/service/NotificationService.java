package com.financetracker.service;

import com.financetracker.entity.Notification;
import com.financetracker.entity.User;
import com.financetracker.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

/**
 * NotificationService - Handles notifications and alerts
 */
@Service
@Transactional
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    /**
     * Create a notification
     */
    public void createNotification(User user, String title, String message, 
                                  Notification.NotificationType type) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .build();

        notificationRepository.save(notification);
    }

    /**
     * Create a notification with related entity
     */
    public void createNotificationWithRelation(User user, String title, String message,
                                               Notification.NotificationType type,
                                               String relatedEntityType, Long relatedEntityId) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .relatedEntityType(relatedEntityType)
                .relatedEntityId(relatedEntityId)
                .build();

        notificationRepository.save(notification);
    }

    /**
     * Get user notifications
     */
    public List<Notification> getUserNotifications(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    /**
     * Get unread notification count
     */
    public long getUnreadCount(User user) {
        return notificationRepository.countByUserAndIsRead(user, false);
    }

    /**
     * Mark notification as read
     */
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId).orElse(null);
        if (notification != null) {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        }
    }

    /**
     * Mark all as read for user
     */
    public void markAllAsRead(User user) {
        List<Notification> unread = notificationRepository.findByUserAndIsRead(user, false);
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }

    /**
     * Delete notification
     */
    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }
}
