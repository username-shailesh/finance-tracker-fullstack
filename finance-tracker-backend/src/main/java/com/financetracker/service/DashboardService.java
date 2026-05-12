package com.financetracker.service;

import com.financetracker.dto.DashboardDTO;
import com.financetracker.entity.Expense;
import com.financetracker.entity.User;
import com.financetracker.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;

/**
 * DashboardService - Handles dashboard operations and statistics
 */
@Service
@Transactional
public class DashboardService {

    @Autowired
    private ExpenseRepository expenseRepository;

    /**
     * Get dashboard data for a specific period
     */
    public DashboardDTO getDashboardData(User user, String month, String year, String startDateStr, String endDateStr) {
        LocalDate start;
        LocalDate end;

        if (startDateStr != null && endDateStr != null) {
            start = LocalDate.parse(startDateStr);
            end = LocalDate.parse(endDateStr);
        } else if (month != null) {
            YearMonth ym = YearMonth.parse(month);
            start = ym.atDay(1);
            end = ym.atEndOfMonth();
        } else if (year != null) {
            start = LocalDate.of(Integer.parseInt(year), 1, 1);
            end = LocalDate.of(Integer.parseInt(year), 12, 31);
        } else {
            // Default to current month
            YearMonth currentMonth = YearMonth.now();
            start = currentMonth.atDay(1);
            end = currentMonth.atEndOfMonth();
        }

        // Calculate totals for the selected period
        BigDecimal periodExpenses = expenseRepository.getTotalExpensesByDateRange(user, start, end);
        periodExpenses = periodExpenses != null ? periodExpenses : BigDecimal.ZERO;

        // Get top category and distribution for the period
        String topCategory = "N/A";
        BigDecimal topAmount = BigDecimal.ZERO;
        java.util.Map<String, BigDecimal> distribution = new java.util.HashMap<>();
        List<Expense> expenses = expenseRepository.findByUserAndDateRange(user, start, end);

        if (!expenses.isEmpty()) {
            distribution = expenses.stream()
                    .collect(java.util.stream.Collectors.groupingBy(
                            e -> e.getCategory().getName(),
                            java.util.stream.Collectors.reducing(
                                    BigDecimal.ZERO,
                                    Expense::getAmount,
                                    BigDecimal::add
                            )
                    ));

            var topCategoryEntry = distribution.entrySet().stream()
                    .max(Comparator.comparing(java.util.Map.Entry::getValue));

            if (topCategoryEntry.isPresent()) {
                topCategory = topCategoryEntry.get().getKey();
                topAmount = topCategoryEntry.get().getValue();
            }
        }

        return DashboardDTO.builder()
                .totalExpenses(expenseRepository.getTotalExpensesByDateRange(user, LocalDate.of(start.getYear(), 1, 1), LocalDate.of(start.getYear(), 12, 31)))
                .monthlyExpenses(periodExpenses)
                .topExpenseCategory(topCategory)
                .topCategoryAmount(topAmount)
                .categoryDistribution(distribution)
                .build();
    }
}
