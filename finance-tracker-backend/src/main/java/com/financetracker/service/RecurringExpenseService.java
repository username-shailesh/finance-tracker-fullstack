package com.financetracker.service;

import com.financetracker.dto.ProcessResultDTO;
import com.financetracker.entity.Expense;
import com.financetracker.entity.Notification;
import com.financetracker.entity.RecurringExpense;
import com.financetracker.entity.User;
import com.financetracker.repository.ExpenseRepository;
import com.financetracker.repository.RecurringExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

/**
 * RecurringExpenseService - Handles recurring expense automation
 * Automatically creates expenses based on recurrence settings
 */
@Service
@Transactional
public class RecurringExpenseService {

    @Autowired
    private RecurringExpenseRepository recurringExpenseRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private BudgetService budgetService;

    /**
     * Process recurring expenses - runs daily at midnight
     */
    @Scheduled(cron = "0 0 0 * * *")
    public ProcessResultDTO processRecurringExpenses() {
        List<RecurringExpense> activeRecurringExpenses = recurringExpenseRepository.findAll()
                .stream()
                .filter(RecurringExpense::getIsActive)
                .toList();

        LocalDate today = LocalDate.now();
        int processed = 0;
        int skipped = 0;

        for (RecurringExpense recurring : activeRecurringExpenses) {
            if (recurring.shouldCreateToday(today)) {
                Expense expense = Expense.builder()
                        .amount(recurring.getAmount())
                        .category(recurring.getCategory())
                        .user(recurring.getUser())
                        .expenseDate(today)
                        .description("Recurring: " + recurring.getName())
                        .paymentMethod(recurring.getPaymentMethod() != null ? recurring.getPaymentMethod() : "AUTO")
                        .status(Expense.ExpenseStatus.CONFIRMED)
                        .build();

                expenseRepository.save(expense);
                
                // Send Notification
                notificationService.createNotificationWithRelation(
                    recurring.getUser(),
                    "Recurring Bill Paid ✅",
                    "Automated payment of " + recurring.getAmount() + " for " + recurring.getName() + " was processed.",
                    Notification.NotificationType.SUBSCRIPTION_REMINDER,
                    "EXPENSE",
                    expense.getId()
                );
                
                // Check Budget
                budgetService.checkAndNotifyBudget(recurring.getUser(), recurring.getCategory().getId(), YearMonth.from(today).toString());
                
                recurring.setLastProcessedDate(today);
                recurringExpenseRepository.save(recurring);
                processed++;
            } else if (recurring.getIsActive()) {
                skipped++;
            }
        }

        String msg = String.format("Processed %d expenses.", processed);
        if (skipped > 0) {
            msg += " Note: Some categories were skipped as they were already registered for this period.";
        }

        return ProcessResultDTO.builder()
                .processedCount(processed)
                .skippedCount(skipped)
                .message(msg)
                .build();
    }

    /**
     * Get all recurring expenses for user
     */
    public List<RecurringExpense> getUserRecurringExpenses(User user) {
        return recurringExpenseRepository.findByUser(user);
    }

    /**
     * Save/Update a recurring expense
     */
    public RecurringExpense save(RecurringExpense recurring) {
        return recurringExpenseRepository.save(recurring);
    }

    /**
     * Get by ID with all relations eagerly loaded
     */
    public RecurringExpense getById(Long id) {
        return recurringExpenseRepository.findByIdWithDetails(id).orElse(null);
    }

    /**
     * Toggle active status
     */
    public RecurringExpense toggleActive(Long id) {
        RecurringExpense recurring = getById(id);
        if (recurring != null) {
            boolean currentStatus = recurring.getIsActive() != null ? recurring.getIsActive() : true;
            recurring.setIsActive(!currentStatus);
            recurring = recurringExpenseRepository.save(recurring);
            // Re-fetch to initialize lazy relations for DTO conversion later
            return getById(id);
        }
        return null;
    }

    /**
     * Delete
     */
    public void delete(Long id) {
        recurringExpenseRepository.deleteById(id);
    }

    /**
     * Get next expense date for a recurring expense
     */
    public LocalDate getNextExpenseDate(RecurringExpense recurring) {
        LocalDate today = LocalDate.now();
        LocalDate start = recurring.getStartDate() != null ? recurring.getStartDate() : today;
        LocalDate next = start;

        if (next.isAfter(today)) return next;

        switch (recurring.getRecurrenceType()) {
            case DAILY:
                return today.isEqual(recurring.getLastProcessedDate() != null ? recurring.getLastProcessedDate() : today.minusDays(1)) 
                       ? today.plusDays(1) : today;
            case WEEKLY:
                next = today.with(java.time.temporal.TemporalAdjusters.nextOrSame(start.getDayOfWeek()));
                if (next.isEqual(recurring.getLastProcessedDate())) {
                    next = next.plusWeeks(1);
                }
                return next;
            case MONTHLY:
                int dom = recurring.getDayOfMonth() != null ? recurring.getDayOfMonth() : start.getDayOfMonth();
                next = today.withDayOfMonth(Math.min(dom, today.lengthOfMonth()));
                if (next.isBefore(today) || next.isEqual(recurring.getLastProcessedDate())) {
                    next = next.plusMonths(1);
                    next = next.withDayOfMonth(Math.min(dom, next.lengthOfMonth()));
                }
                return next;
            case YEARLY:
                next = today.withMonth(start.getMonthValue())
                            .withDayOfMonth(Math.min(start.getDayOfMonth(), today.lengthOfMonth()));
                if (next.isBefore(today) || next.isEqual(recurring.getLastProcessedDate())) {
                    next = next.plusYears(1);
                }
                return next;
            default:
                return today.plusMonths(1);
        }
    }
}
