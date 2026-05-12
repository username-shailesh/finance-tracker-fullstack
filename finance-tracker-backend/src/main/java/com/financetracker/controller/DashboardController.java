package com.financetracker.controller;

import com.financetracker.dto.DashboardDTO;
import com.financetracker.entity.User;
import com.financetracker.security.UserPrincipal;
import com.financetracker.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

/**
 * DashboardController - Handles dashboard endpoints
 */
@RestController
@RequestMapping("/dashboard")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    /**
     * Get dashboard data
     */
    @GetMapping
    public ResponseEntity<?> getDashboard(@AuthenticationPrincipal UserPrincipal principal,
                                         @RequestParam(required = false) String month,
                                         @RequestParam(required = false) String year,
                                         @RequestParam(required = false) String startDate,
                                         @RequestParam(required = false) String endDate) {
        try {
            User user = new User();
            user.setId(principal.getId());
            DashboardDTO dashboard = dashboardService.getDashboardData(user, month, year, startDate, endDate);
            return ResponseEntity.ok(dashboard);
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
