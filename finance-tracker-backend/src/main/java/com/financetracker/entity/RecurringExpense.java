package com.financetracker.entity;

import lombok.*;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * RecurringExpense Entity - Represents automated recurring expenses
 * Handles automatic creation of expenses like rent, subscriptions, etc.
 */
@Entity
@Table(name = "recurring_expenses", indexes = {
    @Index(name = "idx_recurring_user_id", columnList = "user_id"),
    @Index(name = "idx_recurring_category_id", columnList = "category_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecurringExpense {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecurrenceType recurrenceType;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column
    private LocalDate endDate;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(nullable = false)
    private Integer dayOfMonth;  // 1-31, used for monthly recurrence

    @Column
    private LocalDate lastProcessedDate; // Tracks last automated creation date

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public enum RecurrenceType {
        DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY
    }

    /**
     * Check if this recurring expense should create an expense today
     */
    public boolean shouldCreateToday(LocalDate today) {
        if (!isActive || today.isBefore(startDate)) {
            return false;
        }
        if (endDate != null && today.isAfter(endDate)) {
            return false;
        }

        // Prevent duplicates: Check if already processed in this period
        if (lastProcessedDate != null) {
            boolean alreadyProcessed = switch (recurrenceType) {
                case DAILY -> lastProcessedDate.isEqual(today);
                case WEEKLY -> lastProcessedDate.isAfter(today.minusWeeks(1));
                case MONTHLY -> lastProcessedDate.getMonthValue() == today.getMonthValue() && 
                               lastProcessedDate.getYear() == today.getYear();
                case QUARTERLY -> lastProcessedDate.isAfter(today.minusMonths(3));
                case YEARLY -> lastProcessedDate.getYear() == today.getYear();
            };
            if (alreadyProcessed) return false;
        }

        return switch (recurrenceType) {
            case DAILY -> true;
            case WEEKLY -> today.getDayOfWeek().getValue() == startDate.getDayOfWeek().getValue();
            case MONTHLY -> today.getDayOfMonth() == dayOfMonth;
            case QUARTERLY -> today.getMonthValue() % 3 == startDate.getMonthValue() % 3 && 
                              today.getDayOfMonth() == dayOfMonth;
            case YEARLY -> today.getMonthValue() == startDate.getMonthValue() && 
                           today.getDayOfMonth() == dayOfMonth;
        };
    }
}
