package com.financetracker.service;

import com.financetracker.dto.ExpenseDTO;
import com.financetracker.entity.Category;
import com.financetracker.entity.Expense;
import com.financetracker.entity.User;
import com.financetracker.exception.ResourceNotFoundException;
import com.financetracker.repository.CategoryRepository;
import com.financetracker.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

/**
 * ExpenseService - Handles expense operations
 */
@Service
@Transactional
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    @Lazy
    private BudgetService budgetService;

    /**
     * Get all expenses for a user
     */
    public List<ExpenseDTO> getUserExpenses(User user) {
        return expenseRepository.findByUserOrderByExpenseDateDesc(user)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get expenses by date range
     */
    public List<ExpenseDTO> getExpensesByDateRange(User user, LocalDate startDate, LocalDate endDate) {
        return expenseRepository.findByUserAndDateRange(user, startDate, endDate)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get total expenses by date range
     */
    public BigDecimal getTotalExpensesByDateRange(User user, LocalDate startDate, LocalDate endDate) {
        BigDecimal total = expenseRepository.getTotalExpensesByDateRange(user, startDate, endDate);
        return total != null ? total : BigDecimal.ZERO;
    }

    /**
     * Get total expenses by category
     */
    public BigDecimal getTotalByCategory(User user, Long categoryId, LocalDate startDate, LocalDate endDate) {
        BigDecimal total = expenseRepository.getTotalByCategory(user, categoryId, startDate, endDate);
        return total != null ? total : BigDecimal.ZERO;
    }

    /**
     * Create a new expense
     */
    public ExpenseDTO createExpense(ExpenseDTO dto, User user) {
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (!category.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Category not found for this user");
        }

        Expense expense = Expense.builder()
                .amount(dto.getAmount())
                .category(category)
                .user(user)
                .expenseDate(dto.getExpenseDate())
                .description(dto.getDescription())
                .paymentMethod(dto.getPaymentMethod() != null ? dto.getPaymentMethod() : "CASH")
                .receiptUrl(dto.getReceiptUrl())
                .status(Expense.ExpenseStatus.CONFIRMED)
                .build();

        expense = expenseRepository.save(expense);
        
        // Check budget after saving
        budgetService.checkAndNotifyBudget(user, category.getId(), YearMonth.from(dto.getExpenseDate()).toString());
        
        return convertToDTO(expense);
    }

    /**
     * Update an expense
     */
    public ExpenseDTO updateExpense(Long expenseId, ExpenseDTO dto, User user) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));

        if (!expense.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Expense not found for this user");
        }

        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            expense.setCategory(category);
        }

        expense.setAmount(dto.getAmount());
        expense.setExpenseDate(dto.getExpenseDate());
        expense.setDescription(dto.getDescription());
        expense.setPaymentMethod(dto.getPaymentMethod());
        expense.setReceiptUrl(dto.getReceiptUrl());

        expense = expenseRepository.save(expense);
        
        // Check budget after updating
        budgetService.checkAndNotifyBudget(user, expense.getCategory().getId(), YearMonth.from(expense.getExpenseDate()).toString());
        
        return convertToDTO(expense);
    }

    /**
     * Delete an expense
     */
    public void deleteExpense(Long expenseId, User user) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));

        if (!expense.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Expense not found for this user");
        }

        expenseRepository.delete(expense);
    }

    /**
     * Convert Expense entity to DTO
     */
    private ExpenseDTO convertToDTO(Expense expense) {
        return ExpenseDTO.builder()
                .id(expense.getId())
                .amount(expense.getAmount())
                .categoryId(expense.getCategory().getId())
                .categoryName(expense.getCategory().getName())
                .expenseDate(expense.getExpenseDate())
                .description(expense.getDescription())
                .paymentMethod(expense.getPaymentMethod())
                .receiptUrl(expense.getReceiptUrl())
                .status(expense.getStatus().toString())
                .createdAt(expense.getCreatedAt().toString())
                .updatedAt(expense.getUpdatedAt().toString())
                .build();
    }
}
