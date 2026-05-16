package com.financetracker.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // Use SENDER_EMAIL if provided, otherwise fallback to SMTP_USERNAME
    @org.springframework.beans.factory.annotation.Value("${SENDER_EMAIL:${spring.mail.username}}")
    private String fromEmail;

    public void sendVerificationOtp(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Verify Your Finance Tracker Account");
            message.setText("Welcome to Smart Personal Finance Tracker!\n\n"
                    + "Your email verification code is: " + otp + "\n\n"
                    + "This code will expire in 15 minutes. Please enter it in the application to complete your registration.\n\n"
                    + "If you did not create an account, please ignore this email.");
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("CRITICAL EMAIL ERROR: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public void sendPasswordResetOtp(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Reset Your Finance Tracker Password");
        message.setText("We received a request to reset your password.\n\n"
                + "Your password reset code is: " + otp + "\n\n"
                + "This code will expire in 15 minutes.\n\n"
                + "If you did not request a password reset, you can safely ignore this email.");
        mailSender.send(message);
    }
}
