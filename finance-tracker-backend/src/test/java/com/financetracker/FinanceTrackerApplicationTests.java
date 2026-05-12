package com.financetracker;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Main Spring Boot application context test
 * Validates that the application context loads without errors
 */
@SpringBootTest
@ActiveProfiles("test")
class FinanceTrackerApplicationTests {

    @Test
    void contextLoads() {
        // Verifies the Spring application context loads successfully
    }
}
