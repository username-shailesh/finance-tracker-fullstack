package com.financetracker.dto;

import lombok.*;

/**
 * AuthResponseDTO - Data Transfer Object for Authentication Response
 * Contains JWT token and user information
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponseDTO {
    private String token;
    private String refreshToken;
    private UserDTO user;
    private String message;
    private Boolean success;
}
