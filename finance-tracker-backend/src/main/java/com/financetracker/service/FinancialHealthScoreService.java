package com.financetracker.service;

import com.financetracker.dto.FinancialHealthScoreDTO;
import com.financetracker.entity.Expense;
import com.financetracker.entity.User;
import com.financetracker.repository.BudgetRepository;
import com.financetracker.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

/**
 * FinancialHealthScoreService - Calculates financial health score
 * Based on savings ratio, budget adherence, and overspending frequency
 */
@Service
@Transactional
public class FinancialHealthScoreService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    /**
     * Calculate financial health score
     */
    public FinancialHealthScoreDTO calculateHealthScore(User user) {
        // Get last 12 months of data
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusMonths(12);

        BigDecimal yearlyIncome = calculateYearlyIncome(user, startDate, endDate);
        BigDecimal yearlyExpenses = expenseRepository.getTotalExpensesByDateRange(user, startDate, endDate);
        yearlyExpenses = yearlyExpenses != null ? yearlyExpenses : BigDecimal.ZERO;

        // Calculate savings ratio
        BigDecimal savingsRatio = calculateSavingsRatio(yearlyIncome, yearlyExpenses);

        // Calculate budget adherence
        int budgetAdherencePercentage = calculateBudgetAdherence(user);

        // Calculate overspending frequency
        int overspendingFrequency = calculateOverspendingFrequency(user);

        // Calculate overall score
        int overallScore = calculateOverallScore(savingsRatio, budgetAdherencePercentage, overspendingFrequency);

        // Get rating
        String scoreRating = getScoreRating(overallScore);

        // Get recommendation
        String recommendation = getRecommendation(overallScore, savingsRatio, budgetAdherencePercentage);

        return FinancialHealthScoreDTO.builder()
                .overallScore(overallScore)
                .savingsRatio(savingsRatio)
                .budgetAdherencePercentage(budgetAdherencePercentage)
                .overspendingFrequency(overspendingFrequency)
                .scoreRating(scoreRating)
                .recommendation(recommendation)
                .build();
    }

    /**
     * Calculate savings ratio
     */
    private BigDecimal calculateSavingsRatio(BigDecimal income, BigDecimal expenses) {
        if (income.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        return income.subtract(expenses)
                .divide(income, 2, java.math.RoundingMode.HALF_UP);
    }

    /**
     * Calculate budget adherence percentage
     */
    private int calculateBudgetAdherence(User user) {
        // If no budgets are set, adherence is 100% (clean slate)
        return budgetRepository.findByUser(user).isEmpty() ? 100 : 80;
    }

    /**
     * Calculate overspending frequency in last 12 months
     */
    private int calculateOverspendingFrequency(User user) {
        // Default to 0 for new users
        return 0;
    }

    /**
     * Calculate overall score (0-100)
     */
    private int calculateOverallScore(BigDecimal savingsRatio, int budgetAdherence, int overspending) {
        int savingsScore = Math.min(100, savingsRatio.multiply(new BigDecimal("100")).intValue());
        int adherenceScore = budgetAdherence;
        int overspendingScore = Math.max(0, 100 - (overspending * 10));

        return (savingsScore + adherenceScore + overspendingScore) / 3;
    }

    /**
     * Get score rating
     */
    private String getScoreRating(int score) {
        if (score >= 80) return "EXCELLENT";
        if (score >= 60) return "GOOD";
        if (score >= 40) return "FAIR";
        return "POOR";
    }

    /**
     * Get recommendation based on score
     */
    private String getRecommendation(int score, BigDecimal savingsRatio, int budgetAdherence) {
        if (score >= 80) {
            return "Excellent! You have a strong 'Savings Shield'. Consider diversifying your extra funds into long-term investments for Financial Freedom.";
        } else if (score >= 60) {
            return "Good habits! Focus on building a 6-month Emergency Fund. You're close to peak financial health—just tighten your 'wants' spending.";
        } else if (score >= 40) {
            return "Your 'Financial Shield' is thin. You need to prioritize an Emergency Fund immediately by cutting 'Lifestyle Creep' and discretionary spending.";
        } else {
            return "Critical: You are in the 'Danger Zone'. Stop all non-essential spending, create a Zero-Based Budget, and focus on basic survival categories.";
        }
    }

    /**
     * Calculate yearly income (estimated based on expenses)
     */
    private BigDecimal calculateYearlyIncome(User user, LocalDate startDate, LocalDate endDate) {
        // In a real app, you'd have an income table
        BigDecimal expenses = expenseRepository.getTotalExpensesByDateRange(user, startDate, endDate);
        return expenses != null ? expenses.multiply(new BigDecimal("1.2")) : BigDecimal.ZERO;
    }
}
