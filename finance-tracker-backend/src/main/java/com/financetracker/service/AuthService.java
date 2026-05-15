package com.financetracker.service;

import com.financetracker.dto.AuthRequestDTO;
import com.financetracker.dto.AuthResponseDTO;
import com.financetracker.dto.UserDTO;
import com.financetracker.entity.User;
import com.financetracker.entity.Category;
import com.financetracker.exception.ApiException;
import com.financetracker.repository.UserRepository;
import com.financetracker.repository.CategoryRepository;
import com.financetracker.security.JwtTokenProvider;
import com.financetracker.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Arrays;
import java.util.List;

/**
 * AuthService - Handles authentication and user registration
 */
@Service
@Transactional
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    /**
     * Register a new user
     */
    public AuthResponseDTO register(AuthRequestDTO requestDTO) {
        // Check if user already exists
        if (userRepository.existsByEmail(requestDTO.getEmail())) {
            throw new ApiException("Email already registered", 409, "EMAIL_EXISTS");
        }

        if (userRepository.existsByUsername(requestDTO.getUsername())) {
            throw new ApiException("Username already taken", 409, "USERNAME_EXISTS");
        }

        // Create new user
        User user = User.builder()
                .email(requestDTO.getEmail())
                .username(requestDTO.getUsername())
                .password(passwordEncoder.encode(requestDTO.getPassword()))
                .firstName(requestDTO.getFirstName())
                .lastName(requestDTO.getLastName())
                .role(User.UserRole.USER)
                .enabled(true)
                .build();

        user = userRepository.save(user);

        // Create default categories for the new user
        List<Category> defaultCategories = Arrays.asList(
            Category.builder().name("Food").description("Groceries and dining out").color("#FF6B6B").icon("utensils").user(user).isCustom(false).build(),
            Category.builder().name("Housing").description("Rent, mortgage, and utilities").color("#4ECDC4").icon("home").user(user).isCustom(false).build(),
            Category.builder().name("Transportation").description("Gas, transit, and car maintenance").color("#45B7D1").icon("car").user(user).isCustom(false).build(),
            Category.builder().name("Entertainment").description("Movies, games, and fun").color("#F7B731").icon("film").user(user).isCustom(false).build(),
            Category.builder().name("Personal").description("Personal care and clothing").color("#5D62B5").icon("user").user(user).isCustom(false).build()
        );
        categoryRepository.saveAll(defaultCategories);

        // Generate token
        String token = jwtTokenProvider.generateTokenFromUsername(
                user.getUsername(),
                user.getEmail(),
                user.getRole().toString(),
                user.getId()
        );

        return AuthResponseDTO.builder()
                .success(true)
                .message("User registered successfully")
                .token(token)
                .user(convertToDTO(user))
                .build();
    }

    /**
     * Login user
     */
    public AuthResponseDTO login(AuthRequestDTO requestDTO) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            requestDTO.getUsername(),
                            requestDTO.getPassword()
                    )
            );

            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User user = userRepository.findById(userPrincipal.getId())
                    .orElseThrow(() -> new ApiException("User not found", 404));

            String token = jwtTokenProvider.generateToken(authentication);

            return AuthResponseDTO.builder()
                    .success(true)
                    .message("Login successful")
                    .token(token)
                    .user(convertToDTO(user))
                    .build();
        } catch (Exception e) {
            // Log the REAL cause so we can see it in Railway logs
            System.err.println("LOGIN FAILED for user [" + requestDTO.getUsername() + "]: " 
                + e.getClass().getSimpleName() + " - " + e.getMessage());
            throw new ApiException("Invalid username or password: " + e.getMessage(), 401, "INVALID_CREDENTIALS");
        }
    }

    /**
     * Convert User entity to DTO
     */
    private UserDTO convertToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().toString())
                .currency(user.getCurrency())
                .createdAt(user.getCreatedAt().toString())
                .build();
    }
}
