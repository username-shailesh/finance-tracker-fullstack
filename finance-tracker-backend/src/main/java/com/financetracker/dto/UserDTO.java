package com.financetracker.dto;

import lombok.*;

/**
 * UserDTO - Data Transfer Object for User
 * Used for API request/response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private Long id;
    private String email;
    private String username;
    private String firstName;
    private String lastName;
    private String profilePicture;
    private String role;
    private String currency;
    private String country;
    private Boolean enabled;
    private String createdAt;
}
