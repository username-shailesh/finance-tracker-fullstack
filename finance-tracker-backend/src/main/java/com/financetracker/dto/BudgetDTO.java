package com.financetracker.dto;

import lombok.*;
import java.math.BigDecimal;

/**
 * BudgetDTO - Data Transfer Object for Budget
 * Used for API request/response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetDTO {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private BigDecimal limitAmount;
    private String month;
    private Boolean alertEnabled;
    private BigDecimal alertThreshold;
    private BigDecimal spent;
    private BigDecimal remaining;
    private BigDecimal usagePercentage;
    private BigDecimal projectedAmount; // Sum of active recurring expenses for this month
}
