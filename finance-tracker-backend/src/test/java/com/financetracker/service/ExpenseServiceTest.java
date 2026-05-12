package com.financetracker.service;

import com.financetracker.dto.ExpenseDTO;
import com.financetracker.entity.Category;
import com.financetracker.entity.Expense;
import com.financetracker.entity.User;
import com.financetracker.exception.ResourceNotFoundException;
import com.financetracker.repository.CategoryRepository;
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
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ExpenseService
 * Tests CRUD operations and business logic
 */
@ExtendWith(MockitoExtension.class)
class ExpenseServiceTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private ExpenseService expenseService;

    private User testUser;
    private Category testCategory;
    private Expense testExpense;
    private ExpenseDTO testExpenseDTO;

    @BeforeEach
    void setUp() {
        // Set up test user
        testUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .username("testuser")
                .password("encodedPassword")
                .role(User.UserRole.USER)
                .enabled(true)
                .build();

        // Set up test category
        testCategory = Category.builder()
                .id(1L)
                .name("Food")
                .icon("🍔")
                .color("#FF6B6B")
                .user(testUser)
                .build();

        // Set up test expense
        testExpense = Expense.builder()
                .id(1L)
                .amount(new BigDecimal("50.00"))
                .category(testCategory)
                .user(testUser)
                .expenseDate(LocalDate.now())
                .description("Lunch")
                .paymentMethod("CASH")
                .status(Expense.ExpenseStatus.CONFIRMED)
                .build();

        // Set up test DTO
        testExpenseDTO = ExpenseDTO.builder()
                .amount(new BigDecimal("50.00"))
                .categoryId(1L)
                .expenseDate(LocalDate.now())
                .description("Lunch")
                .paymentMethod("CASH")
                .build();

        // Set timestamps via reflection or accept null in tests
        try {
            var createdAt = Expense.class.getDeclaredField("createdAt");
            createdAt.setAccessible(true);
            createdAt.set(testExpense, LocalDateTime.now());
            var updatedAt = Expense.class.getDeclaredField("updatedAt");
            updatedAt.setAccessible(true);
            updatedAt.set(testExpense, LocalDateTime.now());
        } catch (Exception ignored) {}
    }

    // ===================== GET ALL EXPENSES =====================

    @Test
    @DisplayName("Should return all expenses for a user")
    void getUserExpenses_ShouldReturnExpenses() {
        when(expenseRepository.findByUserOrderByExpenseDateDesc(testUser))
                .thenReturn(List.of(testExpense));

        List<ExpenseDTO> result = expenseService.getUserExpenses(testUser);

        assertThat(result).isNotEmpty();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getAmount()).isEqualByComparingTo("50.00");
        verify(expenseRepository, times(1)).findByUserOrderByExpenseDateDesc(testUser);
    }

    @Test
    @DisplayName("Should return empty list when user has no expenses")
    void getUserExpenses_WhenNoExpenses_ShouldReturnEmpty() {
        when(expenseRepository.findByUserOrderByExpenseDateDesc(testUser))
                .thenReturn(List.of());

        List<ExpenseDTO> result = expenseService.getUserExpenses(testUser);

        assertThat(result).isEmpty();
    }

    // ===================== CREATE EXPENSE =====================

    @Test
    @DisplayName("Should create expense successfully")
    void createExpense_ShouldReturnCreatedExpense() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(testCategory));
        when(expenseRepository.save(any(Expense.class))).thenReturn(testExpense);

        ExpenseDTO result = expenseService.createExpense(testExpenseDTO, testUser);

        assertThat(result).isNotNull();
        assertThat(result.getAmount()).isEqualByComparingTo("50.00");
        assertThat(result.getCategoryName()).isEqualTo("Food");
        verify(expenseRepository, times(1)).save(any(Expense.class));
    }

    @Test
    @DisplayName("Should throw exception when category not found on create")
    void createExpense_WhenCategoryNotFound_ShouldThrowException() {
        when(categoryRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> expenseService.createExpense(testExpenseDTO, testUser))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Category not found");
    }

    // ===================== UPDATE EXPENSE =====================

    @Test
    @DisplayName("Should update expense successfully")
    void updateExpense_ShouldReturnUpdatedExpense() {
        ExpenseDTO updateDTO = ExpenseDTO.builder()
                .amount(new BigDecimal("75.00"))
                .categoryId(1L)
                .expenseDate(LocalDate.now())
                .description("Updated Lunch")
                .paymentMethod("CARD")
                .build();

        Expense updatedExpense = Expense.builder()
                .id(1L)
                .amount(new BigDecimal("75.00"))
                .category(testCategory)
                .user(testUser)
                .expenseDate(LocalDate.now())
                .description("Updated Lunch")
                .paymentMethod("CARD")
                .status(Expense.ExpenseStatus.CONFIRMED)
                .build();

        try {
            var createdAt = Expense.class.getDeclaredField("createdAt");
            createdAt.setAccessible(true);
            createdAt.set(updatedExpense, LocalDateTime.now());
            var updatedAt = Expense.class.getDeclaredField("updatedAt");
            updatedAt.setAccessible(true);
            updatedAt.set(updatedExpense, LocalDateTime.now());
        } catch (Exception ignored) {}

        when(expenseRepository.findById(1L)).thenReturn(Optional.of(testExpense));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(testCategory));
        when(expenseRepository.save(any(Expense.class))).thenReturn(updatedExpense);

        ExpenseDTO result = expenseService.updateExpense(1L, updateDTO, testUser);

        assertThat(result.getAmount()).isEqualByComparingTo("75.00");
        assertThat(result.getDescription()).isEqualTo("Updated Lunch");
    }

    @Test
    @DisplayName("Should throw exception when expense not found on update")
    void updateExpense_WhenNotFound_ShouldThrowException() {
        when(expenseRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> expenseService.updateExpense(99L, testExpenseDTO, testUser))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Expense not found");
    }

    // ===================== DELETE EXPENSE =====================

    @Test
    @DisplayName("Should delete expense successfully")
    void deleteExpense_ShouldDelete() {
        when(expenseRepository.findById(1L)).thenReturn(Optional.of(testExpense));
        doNothing().when(expenseRepository).delete(testExpense);

        expenseService.deleteExpense(1L, testUser);

        verify(expenseRepository, times(1)).delete(testExpense);
    }

    @Test
    @DisplayName("Should throw exception when deleting non-existent expense")
    void deleteExpense_WhenNotFound_ShouldThrowException() {
        when(expenseRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> expenseService.deleteExpense(99L, testUser))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ===================== TOTAL CALCULATIONS =====================

    @Test
    @DisplayName("Should return total expenses for date range")
    void getTotalExpensesByDateRange_ShouldReturnTotal() {
        LocalDate start = LocalDate.now().withDayOfMonth(1);
        LocalDate end = LocalDate.now();

        when(expenseRepository.getTotalExpensesByDateRange(testUser, start, end))
                .thenReturn(new BigDecimal("150.00"));

        BigDecimal total = expenseService.getTotalExpensesByDateRange(testUser, start, end);

        assertThat(total).isEqualByComparingTo("150.00");
    }

    @Test
    @DisplayName("Should return zero when no expenses in date range")
    void getTotalExpensesByDateRange_WhenNull_ShouldReturnZero() {
        LocalDate start = LocalDate.now().withDayOfMonth(1);
        LocalDate end = LocalDate.now();

        when(expenseRepository.getTotalExpensesByDateRange(testUser, start, end))
                .thenReturn(null);

        BigDecimal total = expenseService.getTotalExpensesByDateRange(testUser, start, end);

        assertThat(total).isEqualByComparingTo(BigDecimal.ZERO);
    }
}
