package com.financetracker.controller;

import com.financetracker.dto.AuthRequestDTO;
import com.financetracker.dto.AuthResponseDTO;
import com.financetracker.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

/**
 * AuthController - Handles authentication endpoints
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * Register a new user
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequestDTO requestDTO) {
        try {
            AuthResponseDTO response = authService.register(requestDTO);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(400).body(error);
        }
    }

    /**
     * Login user
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequestDTO requestDTO) {
        try {
            AuthResponseDTO response = authService.login(requestDTO);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(401).body(error);
        }
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestBody Map<String, String> request) {
        try {
            AuthResponseDTO response = authService.verifyEmail(request.get("email"), request.get("otp"));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(400).body(error);
        }
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestBody Map<String, String> request) {
        try {
            com.financetracker.entity.OtpToken.OtpType type = com.financetracker.entity.OtpToken.OtpType.valueOf(request.getOrDefault("type", "REGISTRATION"));
            authService.resendOtp(request.get("email"), type);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "OTP resent successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(400).body(error);
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            authService.forgotPassword(request.get("email"));
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Password reset instructions sent to email");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(400).body(error);
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            authService.resetPassword(request.get("email"), request.get("otp"), request.get("newPassword"));
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Password reset successfully. You can now login.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(400).body(error);
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "Authentication service is running");
        return ResponseEntity.ok(response);
    }
}
