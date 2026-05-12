package com.financetracker.repository;

import com.financetracker.entity.Notification;
import com.financetracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * NotificationRepository - Handles database operations for Notification entity
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    List<Notification> findByUserAndIsRead(User user, Boolean isRead);
    Long countByUserAndIsRead(User user, Boolean isRead);
}
