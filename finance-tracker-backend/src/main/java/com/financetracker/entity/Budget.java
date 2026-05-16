package com.financetracker.entity;

import lombok.*;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;

/**
 * Budget Entity - Represents monthly budgets per category
 * Tracks budget limits and current spending against those limits
 */
@Entity
@Table(name = "budgets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Budget {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal limitAmount;

    @Column(name = "budget_month", nullable = false, length = 10)
    private String month;  // Format: "2024-05"

    @Column(nullable = false)
    @Builder.Default
    private Boolean alertEnabled = true;

    @Column(precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal alertThreshold = new BigDecimal("80");  // Alert at 80%

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Calculate budget progress percentage
     */
    public BigDecimal getUsagePercentage(BigDecimal spent) {
        if (limitAmount.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return spent.multiply(new BigDecimal("100")).divide(limitAmount, 2, java.math.RoundingMode.HALF_UP);
    }

    /**
     * Check if budget is exceeded
     */
    public boolean isExceeded(BigDecimal spent) {
        return spent.compareTo(limitAmount) > 0;
    }
}
