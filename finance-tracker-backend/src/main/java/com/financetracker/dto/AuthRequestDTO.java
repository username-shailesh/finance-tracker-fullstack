package com.financetracker.dto;

import lombok.*;

/**
 * AuthRequestDTO - Data Transfer Object for Authentication Request
 * Used for login/signup
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthRequestDTO {
    private String email;
    private String username;
    private String password;
    private String firstName;
    private String lastName;
    private Boolean isSignup;
    private String country;
    private String currency;
}
