package com.financetracker.controller;

import com.financetracker.dto.BudgetDTO;
import com.financetracker.entity.User;
import com.financetracker.security.UserPrincipal;
import com.financetracker.service.BudgetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * BudgetController - Handles budget endpoints
 */
@RestController
@RequestMapping("/budgets")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    /**
     * Get current month budgets
     */
    @GetMapping("/current")
    public ResponseEntity<?> getCurrentMonthBudgets(@AuthenticationPrincipal UserPrincipal principal) {
        try {
            User user = new User();
            user.setId(principal.getId());
            List<BudgetDTO> budgets = budgetService.getCurrentMonthBudgets(user);
            return ResponseEntity.ok(budgets);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * Get budgets by month
     */
    @GetMapping("/{month}")
    public ResponseEntity<?> getBudgetsByMonth(@PathVariable String month,
                                              @AuthenticationPrincipal UserPrincipal principal) {
        try {
            User user = new User();
            user.setId(principal.getId());
            List<BudgetDTO> budgets = budgetService.getBudgetsByMonth(user, month);
            return ResponseEntity.ok(budgets);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * Set or update budget for a category
     */
    @PostMapping("/category/{categoryId}")
    public ResponseEntity<?> setOrUpdateBudget(@PathVariable Long categoryId,
                                              @RequestBody BudgetDTO budgetDTO,
                                              @AuthenticationPrincipal UserPrincipal principal) {
        try {
            User user = new User();
            user.setId(principal.getId());
            BudgetDTO updated = budgetService.setOrUpdateBudget(categoryId, budgetDTO, user);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * Check if budget is exceeded
     */
    @GetMapping("/check/{categoryId}/{month}")
    public ResponseEntity<?> checkBudgetExceeded(@PathVariable Long categoryId,
                                                 @PathVariable String month,
                                                 @AuthenticationPrincipal UserPrincipal principal) {
        try {
            User user = new User();
            user.setId(principal.getId());
            boolean exceeded = budgetService.isBudgetExceeded(user, categoryId, month);
            
            Map<String, Object> response = new HashMap<>();
            response.put("exceeded", exceeded);
            response.put("categoryId", categoryId);
            response.put("month", month);
            
            return ResponseEntity.ok(response);
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
}
