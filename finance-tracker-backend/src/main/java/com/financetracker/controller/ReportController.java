package com.financetracker.controller;

import com.financetracker.service.ReportService;
import com.financetracker.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

/**
 * ReportController - Handles report generation endpoints
 */
@RestController
@RequestMapping("/reports")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ReportController {

    @Autowired
    private ReportService reportService;

    /**
     * Generate monthly PDF report
     */
    @GetMapping("/pdf/{month}")
    public ResponseEntity<?> generatePDFReport(@PathVariable String month,
                                              @RequestParam(defaultValue = "$") String symbol,
                                              @AuthenticationPrincipal UserPrincipal principal) {
        try {
            ByteArrayOutputStream pdf = reportService.generateMonthlyPDFReport(
                    getCurrentUser(principal), month, symbol);
            
            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=expense_report_" + month + ".pdf");
            headers.add("Content-Type", "application/pdf");
            
            return new ResponseEntity<>(pdf.toByteArray(), headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error generating PDF: " + e.getMessage());
        }
    }

    /**
     * Generate monthly AI insights PDF report
     */
    @GetMapping("/ai-pdf/{month}")
    public ResponseEntity<?> generateAIInsightsPDFReport(@PathVariable String month,
                                              @RequestParam(defaultValue = "$") String symbol,
                                              @AuthenticationPrincipal UserPrincipal principal) {
        try {
            ByteArrayOutputStream pdf = reportService.generateAIInsightsPDFReport(
                    getCurrentUser(principal), month, symbol);
            
            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=monthly_ai_insights_report_" + month + ".pdf");
            headers.add("Content-Type", "application/pdf");
            
            return new ResponseEntity<>(pdf.toByteArray(), headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error generating AI PDF: " + e.getMessage());
        }
    }

    /**
     * Generate monthly Excel report
     */
    @GetMapping("/excel/{month}")
    public ResponseEntity<?> generateExcelReport(@PathVariable String month,
                                                @AuthenticationPrincipal UserPrincipal principal) {
        try {
            ByteArrayOutputStream excel = reportService.generateMonthlyExcelReport(
                    getCurrentUser(principal), month);
            
            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=expense_report_" + month + ".xlsx");
            headers.add("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            
            return new ResponseEntity<>(excel.toByteArray(), headers, HttpStatus.OK);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Error generating Excel: " + e.getMessage());
        }
    }

    private com.financetracker.entity.User getCurrentUser(UserPrincipal principal) {
        com.financetracker.entity.User user = new com.financetracker.entity.User();
        user.setId(principal.getId());
        user.setUsername(principal.getUsername());
        return user;
    }
}
