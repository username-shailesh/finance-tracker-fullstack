package com.financetracker.dto;

import lombok.*;

/**
 * AIInsightDTO - Data Transfer Object for AI Insights
 * Contains generated insights and recommendations
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIInsightDTO {
    private String category;
    private String insight;
    private String recommendation;
    private Integer impact;  // -100 to 100, negative means overspending
    private String type;  // ANALYSIS, WARNING, OPPORTUNITY
}
