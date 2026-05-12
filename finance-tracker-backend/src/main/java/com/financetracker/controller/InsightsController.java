package com.financetracker.controller;

import com.financetracker.dto.AIInsightDTO;
import com.financetracker.dto.FinancialHealthScoreDTO;
import com.financetracker.entity.User;
import com.financetracker.security.UserPrincipal;
import com.financetracker.service.AIInsightService;
import com.financetracker.service.FinancialHealthScoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * InsightsController - Handles insights and analysis endpoints
 */
@RestController
@RequestMapping("/insights")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class InsightsController {

    @Autowired
    private AIInsightService aiInsightService;

    @Autowired
    private FinancialHealthScoreService healthScoreService;

    /**
     * Get AI insights
     */
    @GetMapping("/ai")
    public ResponseEntity<?> getAIInsights(@AuthenticationPrincipal UserPrincipal principal) {
        try {
            User user = new User();
            user.setId(principal.getId());
            List<AIInsightDTO> insights = aiInsightService.generateMonthlyInsights(user);
            return ResponseEntity.ok(insights);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * Get financial health score
     */
    @GetMapping("/health-score")
    public ResponseEntity<?> getHealthScore(@AuthenticationPrincipal UserPrincipal principal) {
        try {
            User user = new User();
            user.setId(principal.getId());
            FinancialHealthScoreDTO score = healthScoreService.calculateHealthScore(user);
            return ResponseEntity.ok(score);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(createErrorResponse(e.getMessage()));
        }
    }

    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return response;
    }
}
