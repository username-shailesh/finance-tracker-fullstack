package com.financetracker.service;

import com.financetracker.dto.AIInsightDTO;
import com.financetracker.entity.Category;
import com.financetracker.entity.Expense;
import com.financetracker.entity.User;
import com.financetracker.repository.ExpenseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AIInsightService
 * Tests rule-based AI insight generation logic
 */
@ExtendWith(MockitoExtension.class)
class AIInsightServiceTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private AIInsightService aiInsightService;

    private User testUser;
    private Category foodCategory;
    private Category travelCategory;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .username("testuser")
                .role(User.UserRole.USER)
                .enabled(true)
                .build();

        foodCategory = Category.builder()
                .id(1L)
                .name("Food")
                .icon("🍔")
                .color("#FF6B6B")
                .user(testUser)
                .build();

        travelCategory = Category.builder()
                .id(2L)
                .name("Travel")
                .icon("✈️")
                .color("#4ECDC4")
                .user(testUser)
                .build();
    }

    private Expense buildExpense(Long id, Category category, BigDecimal amount, LocalDate date) {
        return Expense.builder()
                .id(id)
                .amount(amount)
                .category(category)
                .user(testUser)
                .expenseDate(date)
                .description("Test expense")
                .paymentMethod("CASH")
                .status(Expense.ExpenseStatus.CONFIRMED)
                .build();
    }

    @Test
    @DisplayName("Should generate warning insight when spending increases significantly")
    void generateMonthlyInsights_WithHighSpending_ShouldGenerateWarning() {
        LocalDate currentStart = LocalDate.now().withDayOfMonth(1);
        LocalDate currentEnd = LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth());
        LocalDate prevStart = LocalDate.now().minusMonths(1).withDayOfMonth(1);
        LocalDate prevEnd = LocalDate.now().minusMonths(1).withDayOfMonth(
                LocalDate.now().minusMonths(1).lengthOfMonth());

        // Current month: high spending (300)
        List<Expense> currentExpenses = List.of(
                buildExpense(1L, foodCategory, new BigDecimal("150.00"), LocalDate.now()),
                buildExpense(2L, foodCategory, new BigDecimal("150.00"), LocalDate.now())
        );

        // Previous month: low spending (100)
        List<Expense> prevExpenses = List.of(
                buildExpense(3L, foodCategory, new BigDecimal("100.00"), LocalDate.now().minusMonths(1))
        );

        when(expenseRepository.findByUserAndDateRange(eq(testUser), any(), any()))
                .thenReturn(currentExpenses)
                .thenReturn(prevExpenses);

        List<AIInsightDTO> insights = aiInsightService.generateMonthlyInsights(testUser);

        assertThat(insights).isNotEmpty();
        boolean hasWarning = insights.stream()
                .anyMatch(i -> "WARNING".equals(i.getType()));
        assertThat(hasWarning).isTrue();
    }

    @Test
    @DisplayName("Should generate positive insight when spending decreases significantly")
    void generateMonthlyInsights_WithLowSpending_ShouldGenerateOpportunity() {
        // Current month: low spending (50)
        List<Expense> currentExpenses = List.of(
                buildExpense(1L, foodCategory, new BigDecimal("50.00"), LocalDate.now())
        );

        // Previous month: high spending (200)
        List<Expense> prevExpenses = List.of(
                buildExpense(2L, foodCategory, new BigDecimal("200.00"), LocalDate.now().minusMonths(1))
        );

        when(expenseRepository.findByUserAndDateRange(eq(testUser), any(), any()))
                .thenReturn(currentExpenses)
                .thenReturn(prevExpenses);

        List<AIInsightDTO> insights = aiInsightService.generateMonthlyInsights(testUser);

        assertThat(insights).isNotEmpty();
        boolean hasOpportunity = insights.stream()
                .anyMatch(i -> "OPPORTUNITY".equals(i.getType()));
        assertThat(hasOpportunity).isTrue();
    }

    @Test
    @DisplayName("Should return insights even with no previous month data")
    void generateMonthlyInsights_WithNoPreviousData_ShouldReturnSavingsInsights() {
        List<Expense> currentExpenses = List.of(
                buildExpense(1L, foodCategory, new BigDecimal("100.00"), LocalDate.now()),
                buildExpense(2L, travelCategory, new BigDecimal("200.00"), LocalDate.now()),
                buildExpense(3L, foodCategory, new BigDecimal("50.00"), LocalDate.now())
        );

        when(expenseRepository.findByUserAndDateRange(eq(testUser), any(), any()))
                .thenReturn(currentExpenses)
                .thenReturn(List.of()); // no previous month

        List<AIInsightDTO> insights = aiInsightService.generateMonthlyInsights(testUser);

        // Should still return savings opportunity insights
        assertThat(insights).isNotEmpty();
    }

    @Test
    @DisplayName("Should detect unusual spending when expense is 2x the average")
    void generateMonthlyInsights_WithUnusualExpense_ShouldDetectAnomaly() {
        List<Expense> currentExpenses = List.of(
                buildExpense(1L, foodCategory, new BigDecimal("10.00"), LocalDate.now()),
                buildExpense(2L, foodCategory, new BigDecimal("10.00"), LocalDate.now()),
                buildExpense(3L, foodCategory, new BigDecimal("10.00"), LocalDate.now()),
                buildExpense(4L, travelCategory, new BigDecimal("500.00"), LocalDate.now()) // unusual
        );

        when(expenseRepository.findByUserAndDateRange(eq(testUser), any(), any()))
                .thenReturn(currentExpenses)
                .thenReturn(List.of());

        List<AIInsightDTO> insights = aiInsightService.generateMonthlyInsights(testUser);

        boolean hasUnusualWarning = insights.stream()
                .anyMatch(i -> "WARNING".equals(i.getType()) &&
                        i.getInsight().contains("Unusual"));
        assertThat(hasUnusualWarning).isTrue();
    }

    @Test
    @DisplayName("Should return empty insights when no expenses at all")
    void generateMonthlyInsights_WithNoExpenses_ShouldReturnEmpty() {
        when(expenseRepository.findByUserAndDateRange(eq(testUser), any(), any()))
                .thenReturn(List.of())
                .thenReturn(List.of());

        List<AIInsightDTO> insights = aiInsightService.generateMonthlyInsights(testUser);

        assertThat(insights).isEmpty();
    }
}
