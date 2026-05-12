package com.financetracker.service;

import com.financetracker.dto.BudgetDTO;
import com.financetracker.entity.Budget;
import com.financetracker.entity.Category;
import com.financetracker.entity.User;
import com.financetracker.exception.ResourceNotFoundException;
import com.financetracker.repository.BudgetRepository;
import com.financetracker.repository.CategoryRepository;
import com.financetracker.repository.RecurringExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

/**
 * BudgetService - Handles budget operations
 */
@Service
@Transactional
public class BudgetService {

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private RecurringExpenseRepository recurringExpenseRepository;

    @Autowired
    private ExpenseService expenseService;

    /**
     * Get all budgets for current month
     */
    public List<BudgetDTO> getCurrentMonthBudgets(User user) {
        String currentMonth = YearMonth.now().toString();
        return budgetRepository.findByUserAndMonth(user, currentMonth)
                .stream()
                .map(budget -> enrichBudgetDTO(budget, user))
                .collect(Collectors.toList());
    }

    /**
     * Get budgets by month or year (including categories with expenses but no budget)
     */
    public List<BudgetDTO> getBudgetsByMonth(User user, String period) {
        List<Category> allUserCategories = categoryRepository.findByUser(user);
        
        if (period.length() == 4) {
            // Yearly aggregation
            List<Budget> yearlyBudgets = budgetRepository.findByUser(user).stream()
                    .filter(b -> b.getMonth().startsWith(period))
                    .collect(Collectors.toList());

            // Get categories that have expenses in this year
            LocalDate startDate = LocalDate.of(Integer.parseInt(period), 1, 1);
            LocalDate endDate = LocalDate.of(Integer.parseInt(period), 12, 31);
            
            return allUserCategories.stream()
                    .map(category -> {
                        List<Budget> catBudgets = yearlyBudgets.stream()
                                .filter(b -> b.getCategory().getId().equals(category.getId()))
                                .collect(Collectors.toList());
                        
                        BigDecimal spent = expenseService.getTotalByCategory(user, category.getId(), startDate, endDate);
                        
                        // If no budget and no spending, skip to keep list clean
                        if (catBudgets.isEmpty() && spent.compareTo(BigDecimal.ZERO) <= 0) return null;
                        
                        return aggregateBudgets(catBudgets, category, user, period, spent);
                    })
                    .filter(java.util.Objects::nonNull)
                    .collect(Collectors.toList());
        }

        // Monthly view
        YearMonth yearMonth = YearMonth.parse(period);
        LocalDate start = yearMonth.atDay(1);
        LocalDate end = yearMonth.atEndOfMonth();

        return allUserCategories.stream()
                .map(category -> {
                    Budget budget = budgetRepository.findByUserAndCategoryIdAndMonth(user, category.getId(), period)
                            .orElse(null);
                    
                    BigDecimal spent = expenseService.getTotalByCategory(user, category.getId(), start, end);
                    
                    // If no budget and no spending, skip
                    if (budget == null && spent.compareTo(BigDecimal.ZERO) <= 0) return null;
                    
                    return enrichBudgetDTO(budget, category, user, period, spent);
                })
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList());
    }

    /**
     * Aggregate multiple monthly budgets into a yearly view
     */
    private BudgetDTO aggregateBudgets(List<Budget> budgets, Category category, User user, String year, BigDecimal spent) {
        BigDecimal totalLimit = budgets.stream()
                .map(Budget::getLimitAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal remaining = totalLimit.subtract(spent);
        
        BigDecimal usagePercentage = BigDecimal.ZERO;
        if (totalLimit.compareTo(BigDecimal.ZERO) > 0) {
            usagePercentage = spent.multiply(new BigDecimal("100"))
                    .divide(totalLimit, 2, java.math.RoundingMode.HALF_UP);
        } else if (spent.compareTo(BigDecimal.ZERO) > 0) {
            usagePercentage = new BigDecimal("101"); // Over 100% if spending with 0 budget
        }

        return BudgetDTO.builder()
                .id(budgets.isEmpty() ? null : budgets.get(0).getId())
                .categoryId(category.getId())
                .categoryName(category.getName())
                .limitAmount(totalLimit)
                .month(year)
                .spent(spent)
                .remaining(remaining.max(BigDecimal.ZERO))
                .usagePercentage(usagePercentage)
                .build();
    }

    /**
     * Create or update a budget
     */
    public BudgetDTO setOrUpdateBudget(Long categoryId, BudgetDTO dto, User user) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (!category.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Category not found for this user");
        }

        String month = dto.getMonth() != null ? dto.getMonth() : YearMonth.now().toString();

        Budget budget = budgetRepository.findByUserAndCategoryIdAndMonth(user, categoryId, month)
                .orElse(Budget.builder()
                        .user(user)
                        .category(category)
                        .month(month)
                        .alertEnabled(true)
                        .build());

        budget.setLimitAmount(dto.getLimitAmount());
        budget.setAlertThreshold(dto.getAlertThreshold() != null ? dto.getAlertThreshold() : new BigDecimal("80"));
        budget.setAlertEnabled(dto.getAlertEnabled() != null ? dto.getAlertEnabled() : true);

        budget = budgetRepository.save(budget);
        
        YearMonth ym = YearMonth.parse(month);
        BigDecimal spent = expenseService.getTotalByCategory(user, categoryId, ym.atDay(1), ym.atEndOfMonth());
        return enrichBudgetDTO(budget, category, user, month, spent);
    }

    /**
     * Check if budget is exceeded
     */
    public boolean isBudgetExceeded(User user, Long categoryId, String month) {
        Budget budget = budgetRepository.findByUserAndCategoryIdAndMonth(user, categoryId, month)
                .orElse(null);

        if (budget == null) return false;

        YearMonth yearMonth = YearMonth.parse(month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        BigDecimal spent = expenseService.getTotalByCategory(user, categoryId, startDate, endDate);
        return budget.isExceeded(spent);
    }

    /**
     * Enrich budget DTO with spent and remaining amounts
     */
    private BudgetDTO enrichBudgetDTO(Budget budget, Category category, User user, String month, BigDecimal spent) {
        BigDecimal limit = budget != null ? budget.getLimitAmount() : BigDecimal.ZERO;
        BigDecimal remaining = limit.subtract(spent);
        
        BigDecimal usagePercentage = BigDecimal.ZERO;
        if (limit.compareTo(BigDecimal.ZERO) > 0) {
            usagePercentage = spent.multiply(new BigDecimal("100"))
                    .divide(limit, 2, java.math.RoundingMode.HALF_UP);
        } else if (spent.compareTo(BigDecimal.ZERO) > 0) {
            usagePercentage = new BigDecimal("101"); // "Over 100%" flag
        }

        // Calculate projected amount from active recurring expenses
        BigDecimal projectedAmount = recurringExpenseRepository.findByUserAndIsActive(user, true)
                .stream()
                .filter(r -> r.getCategory().getId().equals(category.getId()))
                .map(r -> r.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return BudgetDTO.builder()
                .id(budget != null ? budget.getId() : null)
                .categoryId(category.getId())
                .categoryName(category.getName())
                .limitAmount(limit)
                .month(month)
                .alertEnabled(budget != null ? budget.getAlertEnabled() : false)
                .alertThreshold(budget != null ? budget.getAlertThreshold() : BigDecimal.ZERO)
                .spent(spent)
                .remaining(remaining.max(BigDecimal.ZERO))
                .usagePercentage(usagePercentage)
                .projectedAmount(projectedAmount)
                .build();
    }

    /**
     * Overloaded helper for backward compatibility or direct calls
     */
    private BudgetDTO enrichBudgetDTO(Budget budget, User user) {
        YearMonth ym = YearMonth.parse(budget.getMonth());
        BigDecimal spent = expenseService.getTotalByCategory(user, budget.getCategory().getId(), ym.atDay(1), ym.atEndOfMonth());
        return enrichBudgetDTO(budget, budget.getCategory(), user, budget.getMonth(), spent);
    }
}
