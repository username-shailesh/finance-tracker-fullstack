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
     * Process recurring expenses - runs daily at midnight or manually triggered
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
            LocalDate start = recurring.getStartDate() != null ? recurring.getStartDate() : today;
            if (today.isBefore(start)) {
                skipped++;
                continue;
            }
            if (recurring.getEndDate() != null && today.isAfter(recurring.getEndDate())) {
                skipped++;
                continue;
            }

            LocalDate nextDueDate = getNextDueDateForSweep(recurring, today);
            boolean hasProcessedAny = false;

            while (nextDueDate != null && !nextDueDate.isAfter(today)) {
                Expense expense = Expense.builder()
                        .amount(recurring.getAmount())
                        .category(recurring.getCategory())
                        .user(recurring.getUser())
                        .expenseDate(nextDueDate) // Record historical expense on the exact due date!
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
                budgetService.checkAndNotifyBudget(recurring.getUser(), recurring.getCategory().getId(), YearMonth.from(nextDueDate).toString());
                
                recurring.setLastProcessedDate(nextDueDate);
                recurring = recurringExpenseRepository.save(recurring);
                
                processed++;
                hasProcessedAny = true;
                
                nextDueDate = getNextDueDateForSweep(recurring, today);
            }

            if (!hasProcessedAny) {
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
     * Helper to compute the chronological next due date for the processing loop
     */
    private LocalDate getNextDueDateForSweep(RecurringExpense recurring, LocalDate today) {
        LocalDate lastProcessed = recurring.getLastProcessedDate();
        LocalDate start = recurring.getStartDate() != null ? recurring.getStartDate() : today;
        
        if (lastProcessed == null) {
            return start;
        }
        
        return switch (recurring.getRecurrenceType()) {
            case DAILY -> lastProcessed.plusDays(1);
            case WEEKLY -> lastProcessed.plusWeeks(1);
            case MONTHLY -> {
                int dom = recurring.getDayOfMonth() != null ? recurring.getDayOfMonth() : start.getDayOfMonth();
                LocalDate next = lastProcessed.plusMonths(1);
                yield next.withDayOfMonth(Math.min(dom, next.lengthOfMonth()));
            }
            case QUARTERLY -> {
                int dom = recurring.getDayOfMonth() != null ? recurring.getDayOfMonth() : start.getDayOfMonth();
                LocalDate next = lastProcessed.plusMonths(3);
                yield next.withDayOfMonth(Math.min(dom, next.lengthOfMonth()));
            }
            case YEARLY -> {
                int dom = start.getDayOfMonth();
                LocalDate next = lastProcessed.plusYears(1);
                yield next.withDayOfMonth(Math.min(dom, next.lengthOfMonth()));
            }
        };
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
        // Always use JOIN FETCH variant to avoid LazyInitializationException
        RecurringExpense recurring = recurringExpenseRepository.findByIdWithDetails(id).orElse(null);
        if (recurring == null) return null;

        boolean currentStatus = Boolean.TRUE.equals(recurring.getIsActive());
        recurring.setIsActive(!currentStatus);
        recurringExpenseRepository.save(recurring);

        // Re-fetch with full relations so convertToDTO works correctly
        return recurringExpenseRepository.findByIdWithDetails(id).orElse(null);
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
            case QUARTERLY:
                int qDom = recurring.getDayOfMonth() != null ? recurring.getDayOfMonth() : start.getDayOfMonth();
                next = today.withMonth(start.getMonthValue())
                            .withDayOfMonth(Math.min(qDom, today.lengthOfMonth()));
                while (next.isBefore(today) || (recurring.getLastProcessedDate() != null && next.isEqual(recurring.getLastProcessedDate()))) {
                    next = next.plusMonths(3);
                }
                return next;
            case YEARLY:
                next = today.withMonth(start.getMonthValue())
                            .withDayOfMonth(Math.min(start.getDayOfMonth(), today.lengthOfMonth()));
                if (next.isBefore(today) || (recurring.getLastProcessedDate() != null && next.isEqual(recurring.getLastProcessedDate()))) {
                    next = next.plusYears(1);
                }
                return next;
            default:
                return today.plusMonths(1);
        }
    }
}
