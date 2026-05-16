package com.financetracker.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @org.springframework.beans.factory.annotation.Value("${BREVO_API_KEY:}")
    private String apiKey;

    @org.springframework.beans.factory.annotation.Value("${SENDER_EMAIL:}")
    private String fromEmail;

    private final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

    public void sendVerificationOtp(String toEmail, String otp) {
        sendEmailViaApi(toEmail, "Verify Your Finance Tracker Account", 
            "Welcome to Smart Personal Finance Tracker!\n\n"
            + "Your email verification code is: " + otp + "\n\n"
            + "This code will expire in 15 minutes. Please enter it in the application to complete your registration.");
    }

    private void sendEmailViaApi(String toEmail, String subject, String content) {
        try {
            if (apiKey == null || apiKey.isEmpty()) {
                throw new RuntimeException("BREVO_API_KEY is missing!");
            }

            java.net.URL url = new java.net.URL(BREVO_API_URL);
            java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("api-key", apiKey);
            conn.setDoOutput(true);

            // Properly escape newlines for JSON
            String escapedContent = content.replace("\n", "\\n").replace("\"", "\\\"");

            String jsonPayload = "{"
                + "\"sender\":{\"email\":\"" + fromEmail + "\"},"
                + "\"to\":[{\"email\":\"" + toEmail + "\"}],"
                + "\"subject\":\"" + subject + "\","
                + "\"textContent\":\"" + escapedContent + "\""
                + "}";

            try (java.io.OutputStream os = conn.getOutputStream()) {
                byte[] input = jsonPayload.getBytes("utf-8");
                os.write(input, 0, input.length);
            }

            int responseCode = conn.getResponseCode();
            if (responseCode >= 200 && responseCode < 300) {
                System.out.println("Email successfully sent via Brevo API to: " + toEmail);
            } else {
                // Read error stream
                java.io.InputStream es = conn.getErrorStream();
                String errorDetail = "";
                if (es != null) {
                    java.util.Scanner s = new java.util.Scanner(es).useDelimiter("\\A");
                    errorDetail = s.hasNext() ? s.next() : "";
                }
                throw new RuntimeException("Brevo API Error (" + responseCode + "): " + errorDetail);
            }
        } catch (Exception e) {
            System.err.println("CRITICAL EMAIL API ERROR: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException(e.getMessage());
        }
    }

    public void sendPasswordResetOtp(String toEmail, String otp) {
        sendEmailViaApi(toEmail, "Reset Your Password - Finance Tracker", 
            "We received a request to reset your password.\n\n"
            + "Your password reset code is: " + otp + "\n\n"
            + "This code will expire in 15 minutes. If you did not request this, please ignore this email.");
    }
}
