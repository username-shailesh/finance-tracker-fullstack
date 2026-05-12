package com.financetracker.dto;

import lombok.*;
import java.math.BigDecimal;

/**
 * DashboardDTO - Data Transfer Object for Dashboard
 * Contains summary statistics and insights
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardDTO {
    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal totalSavings;
    private BigDecimal monthlyExpenses;
    private BigDecimal monthlyBudgetLimit;
    private BigDecimal savingsRatio;
    private Integer financialHealthScore;
    private String topExpenseCategory;
    private BigDecimal topCategoryAmount;
    private java.util.Map<String, BigDecimal> categoryDistribution;
}
