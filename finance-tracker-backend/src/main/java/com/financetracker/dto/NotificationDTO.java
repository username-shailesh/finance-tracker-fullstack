package com.financetracker.dto;

import lombok.*;

/**
 * NotificationDTO - Data Transfer Object for notifications
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {
    private Long id;
    private String title;
    private String message;
    private String type;
    private Boolean isRead;
    private String relatedEntityType;
    private Long relatedEntityId;
    private String createdAt;
}
