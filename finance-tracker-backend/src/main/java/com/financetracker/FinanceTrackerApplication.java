package com.financetracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * FinanceTrackerApplication - Main entry point for the Finance Tracker application
 * REST API for managing personal finance and expenses
 */
@SpringBootApplication
@EnableScheduling
public class FinanceTrackerApplication {

    public static void main(String[] args) {
        SpringApplication.run(FinanceTrackerApplication.class, args);
        System.out.println("================================================");
        System.out.println("Finance Tracker Application Started Successfully");
        System.out.println("API Base URL: http://localhost:8080/api");
        System.out.println("================================================");
    }
}
