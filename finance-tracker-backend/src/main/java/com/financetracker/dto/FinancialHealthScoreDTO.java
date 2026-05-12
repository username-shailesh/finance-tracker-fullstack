package com.financetracker.dto;

import lombok.*;
import java.math.BigDecimal;

/**
 * FinancialHealthScoreDTO - Data Transfer Object for Financial Health Score
 * Contains score breakdown and metrics
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinancialHealthScoreDTO {
    private Integer overallScore;  // 0-100
    private BigDecimal savingsRatio;  // 0-1
    private Integer budgetAdherencePercentage;
    private Integer overspendingFrequency;  // Number of months overspent
    private String scoreRating;  // EXCELLENT, GOOD, FAIR, POOR
    private String recommendation;
}
