package com.financetracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecurringExpenseDTO {
    private Long id;
    private String name;
    private String description;
    private BigDecimal amount;
    private Long categoryId;
    private String categoryName;
    private String frequency; // Maps to RecurrenceType
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isActive;
    private String paymentMethod;
    private LocalDate lastProcessedDate;
    private LocalDate nextDueDate;
}
