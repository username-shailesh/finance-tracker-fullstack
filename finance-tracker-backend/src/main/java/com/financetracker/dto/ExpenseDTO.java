package com.financetracker.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * ExpenseDTO - Data Transfer Object for Expense
 * Used for API request/response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseDTO {
    private Long id;
    private BigDecimal amount;
    private Long categoryId;
    private String categoryName;
    private LocalDate expenseDate;
    private String description;
    private String paymentMethod;
    private String receiptUrl;
    private String status;
    private String createdAt;
    private String updatedAt;
}
