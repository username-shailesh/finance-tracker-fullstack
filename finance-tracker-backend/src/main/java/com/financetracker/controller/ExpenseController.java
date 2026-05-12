package com.financetracker.controller;

import com.financetracker.dto.ExpenseDTO;
import com.financetracker.entity.User;
import com.financetracker.security.UserPrincipal;
import com.financetracker.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * ExpenseController - Handles expense endpoints
 */
@RestController
@RequestMapping("/expenses")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    /**
     * Get all expenses for user
     */
    @GetMapping
    public ResponseEntity<?> getAllExpenses(@AuthenticationPrincipal UserPrincipal principal) {
        try {
            User user = new User();
            user.setId(principal.getId());
            List<ExpenseDTO> expenses = expenseService.getUserExpenses(user);
            return ResponseEntity.ok(expenses);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * Get expenses by date range
     */
    @GetMapping("/range")
    public ResponseEntity<?> getExpensesByRange(
            @RequestParam String startDate,
            @RequestParam String endDate,
            @AuthenticationPrincipal UserPrincipal principal) {
        try {
            User user = new User();
            user.setId(principal.getId());
            List<ExpenseDTO> expenses = expenseService.getExpensesByDateRange(
                    user,
                    LocalDate.parse(startDate),
                    LocalDate.parse(endDate)
            );
            return ResponseEntity.ok(expenses);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * Create a new expense
     */
    @PostMapping
    public ResponseEntity<?> createExpense(@RequestBody ExpenseDTO expenseDTO,
                                          @AuthenticationPrincipal UserPrincipal principal) {
        try {
            User user = new User();
            user.setId(principal.getId());
            ExpenseDTO created = expenseService.createExpense(expenseDTO, user);
            return ResponseEntity.status(201).body(created);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * Update an expense
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateExpense(@PathVariable Long id,
                                          @RequestBody ExpenseDTO expenseDTO,
                                          @AuthenticationPrincipal UserPrincipal principal) {
        try {
            User user = new User();
            user.setId(principal.getId());
            ExpenseDTO updated = expenseService.updateExpense(id, expenseDTO, user);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * Delete an expense
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExpense(@PathVariable Long id,
                                          @AuthenticationPrincipal UserPrincipal principal) {
        try {
            User user = new User();
            user.setId(principal.getId());
            expenseService.deleteExpense(id, user);
            return ResponseEntity.ok(createSuccessResponse("Expense deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(createErrorResponse(e.getMessage()));
        }
    }

    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return response;
    }

    private Map<String, Object> createSuccessResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        return response;
    }
}
