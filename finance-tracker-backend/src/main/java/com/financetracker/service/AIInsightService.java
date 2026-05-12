package com.financetracker.service;

import com.financetracker.dto.AIInsightDTO;
import com.financetracker.entity.Expense;
import com.financetracker.entity.User;
import com.financetracker.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

/**
 * AIInsightService - Generates AI-driven insights about spending patterns
 * Implements rule-based AI logic for spending analysis and recommendations
 */
@Service
@Transactional
public class AIInsightService {

    @Autowired
    private ExpenseRepository expenseRepository;
 
    private static final Set<String> ESSENTIAL_CATEGORIES = new HashSet<>(Arrays.asList(
        "FOOD", "RENT", "HEALTH", "BILLS", "UTILITIES", "MEDICINE", "TRANSPORT", "GROCERIES", "EDUCATION"
    ));

    /**
     * Generate insights for current month
     */
    public List<AIInsightDTO> generateMonthlyInsights(User user) {
        List<AIInsightDTO> insights = new ArrayList<>();

        YearMonth currentMonth = YearMonth.now();
        LocalDate monthStart = currentMonth.atDay(1);
        LocalDate monthEnd = currentMonth.atEndOfMonth();

        YearMonth previousMonth = currentMonth.minusMonths(1);
        LocalDate prevMonthStart = previousMonth.atDay(1);
        LocalDate prevMonthEnd = previousMonth.atEndOfMonth();

        // Get expenses
        List<Expense> currentMonthExpenses = expenseRepository.findByUserAndDateRange(user, monthStart, monthEnd);
        List<Expense> previousMonthExpenses = expenseRepository.findByUserAndDateRange(user, prevMonthStart, prevMonthEnd);

        // Calculate totals
        BigDecimal currentTotal = currentMonthExpenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal previousTotal = previousMonthExpenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 1. Spending comparison insight
        insights.addAll(analyzeSpendingTrend(currentTotal, previousTotal));

        // 2. Category-wise analysis
        insights.addAll(analyzeCategorySpending(currentMonthExpenses, previousMonthExpenses));

        // 3. Unusual spending detection
        insights.addAll(detectUnusualSpending(currentMonthExpenses));

        // 4. Savings opportunity
        insights.addAll(identifySavingsOpportunities(currentMonthExpenses));

        return insights;
    }

    /**
     * Analyze spending trend compared to previous month
     */
    private List<AIInsightDTO> analyzeSpendingTrend(BigDecimal current, BigDecimal previous) {
        List<AIInsightDTO> insights = new ArrayList<>();

        if (previous.compareTo(BigDecimal.ZERO) == 0) {
            return insights;
        }

        BigDecimal percentChange = current.subtract(previous)
                .multiply(new BigDecimal("100"))
                .divide(previous, 2, java.math.RoundingMode.HALF_UP);

        if (percentChange.compareTo(new BigDecimal("20")) > 0) {
            insights.add(AIInsightDTO.builder()
                    .category("Overall Spending")
                    .insight("Critical: Total spending increased by " + percentChange + "% vs last month")
                    .recommendation("Your spending is outpacing your typical habits. Review 'discretionary' categories like Dining and Entertainment to avoid depleting your emergency fund.")
                    .impact(-percentChange.intValue())
                    .type("WARNING")
                    .build());
        } else if (percentChange.compareTo(new BigDecimal("-20")) < 0) {
            insights.add(AIInsightDTO.builder()
                    .category("Overall Spending")
                    .insight("Great Trend: Spending is down " + percentChange.negate() + "% this month")
                    .recommendation("Consider moving these extra savings into an Emergency Fund or High-Yield Savings Account.")
                    .impact(percentChange.intValue())
                    .type("OPPORTUNITY")
                    .build());
        }

        return insights;
    }

    /**
     * Analyze category-wise spending
     */
    private List<AIInsightDTO> analyzeCategorySpending(List<Expense> current, List<Expense> previous) {
        List<AIInsightDTO> insights = new ArrayList<>();

        Map<String, BigDecimal> currentByCategory = groupByCategory(current);
        Map<String, BigDecimal> previousByCategory = groupByCategory(previous);

        for (String category : currentByCategory.keySet()) {
            BigDecimal currentAmount = currentByCategory.get(category);
            BigDecimal previousAmount = previousByCategory.getOrDefault(category, BigDecimal.ZERO);

            if (previousAmount.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal percentChange = currentAmount.subtract(previousAmount)
                        .multiply(new BigDecimal("100"))
                        .divide(previousAmount, 2, java.math.RoundingMode.HALF_UP);
 
                if (percentChange.compareTo(new BigDecimal("20")) > 0) {
                    boolean isEssential = ESSENTIAL_CATEGORIES.contains(category.toUpperCase());
                    
                    if (isEssential) {
                        insights.add(AIInsightDTO.builder()
                                .category(category)
                                .insight("Essential Spending Check: " + category + " is up by " + percentChange + "%")
                                .recommendation("Since " + category + " is essential for health and living, don't worry too much, but consider bulk buying or loyalty programs to manage inflation.")
                                .impact(-5) // Low impact on health score because it's essential
                                .type("ANALYSIS")
                                .build());
                    } else {
                        insights.add(AIInsightDTO.builder()
                                .category(category)
                                .insight("Discretionary Spike: " + category + " spending increased by " + percentChange + "%!")
                                .recommendation("This is a 'Want' category. To protect your savings, consider cutting back on " + category + " next month.")
                                .impact(-percentChange.intValue())
                                .type("WARNING")
                                .build());
                    }
                }
            }
        }

        return insights;
    }

    /**
     * Detect unusual spending patterns
     */
    private List<AIInsightDTO> detectUnusualSpending(List<Expense> expenses) {
        List<AIInsightDTO> insights = new ArrayList<>();

        if (expenses.isEmpty()) return insights;

        // Find unusually high expenses
        BigDecimal averageAmount = expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(new BigDecimal(expenses.size()), 2, java.math.RoundingMode.HALF_UP);

        BigDecimal threshold = averageAmount.multiply(new BigDecimal("2"));

        List<Expense> unusualExpenses = expenses.stream()
                .filter(e -> e.getAmount().compareTo(threshold) > 0)
                .collect(Collectors.toList());

        if (!unusualExpenses.isEmpty()) {
            unusualExpenses.stream()
                    .limit(3)
                    .forEach(expense -> insights.add(AIInsightDTO.builder()
                            .category(expense.getCategory().getName())
                            .insight("Unusual high expense of " + expense.getAmount() + " detected on " + expense.getExpenseDate())
                            .recommendation("Review this expense - it's " + expense.getAmount()
                                    .divide(averageAmount, 2, java.math.RoundingMode.HALF_UP)
                                    .subtract(BigDecimal.ONE)
                                    .multiply(new BigDecimal("100"))
                                    .setScale(0, java.math.RoundingMode.HALF_UP) + "% above your average")
                            .impact(-25)
                            .type("WARNING")
                            .build()));
        }

        return insights;
    }

    /**
     * Identify savings opportunities
     */
    private List<AIInsightDTO> identifySavingsOpportunities(List<Expense> expenses) {
        List<AIInsightDTO> insights = new ArrayList<>();

        Map<String, BigDecimal> byCategory = groupByCategory(expenses);

        // Identify top 3 spending categories
        byCategory.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .limit(3)
                .forEach(entry -> {
                    BigDecimal reduction = entry.getValue().multiply(new BigDecimal("0.1")); // 10% reduction
                    insights.add(AIInsightDTO.builder()
                            .category(entry.getKey())
                            .insight("You could save " + reduction.setScale(2, java.math.RoundingMode.HALF_UP)
                                    + " by reducing " + entry.getKey() + " spending by 10%")
                            .recommendation("Look for alternatives or discounts in " + entry.getKey())
                            .impact(10)
                            .type("OPPORTUNITY")
                            .build());
                });

        return insights;
    }

    /**
     * Group expenses by category
     */
    private Map<String, BigDecimal> groupByCategory(List<Expense> expenses) {
        return expenses.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getCategory().getName(),
                        Collectors.reducing(
                                BigDecimal.ZERO,
                                Expense::getAmount,
                                BigDecimal::add
                        )
                ));
    }
}
