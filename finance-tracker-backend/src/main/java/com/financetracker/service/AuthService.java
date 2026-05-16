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

    @Autowired
    private EmailService emailService;

    @Autowired
    private com.financetracker.repository.OtpTokenRepository otpTokenRepository;

    private String generateOtp() {
        return String.format("%06d", new java.util.Random().nextInt(999999));
    }

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

        // Validate first name
        if (requestDTO.getFirstName() == null || requestDTO.getFirstName().trim().length() < 2) {
            throw new ApiException("First name must be at least 2 characters", 400, "INVALID_NAME");
        }
        
        // Last name is optional, but if provided, we can just trim it. 
        // No minimum length required for last name to match standards like Google/Instagram.

        // Validate username
        if (requestDTO.getUsername() == null || requestDTO.getUsername().trim().length() < 3) {
            throw new ApiException("Username must be at least 3 characters", 400, "INVALID_USERNAME");
        }

        // Validate password complexity
        String password = requestDTO.getPassword();
        if (password == null || password.length() < 8) {
            throw new ApiException("Password must be at least 8 characters long", 400, "WEAK_PASSWORD");
        }
        if (!password.matches(".*[A-Z].*")) {
            throw new ApiException("Password must contain at least one uppercase letter", 400, "WEAK_PASSWORD");
        }
        if (!password.matches(".*[a-z].*")) {
            throw new ApiException("Password must contain at least one lowercase letter", 400, "WEAK_PASSWORD");
        }
        if (!password.matches(".*\\d.*")) {
            throw new ApiException("Password must contain at least one number", 400, "WEAK_PASSWORD");
        }
        if (!password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?].*")) {
            throw new ApiException("Password must contain at least one special character", 400, "WEAK_PASSWORD");
        }

        // DO NOT save the user yet.
        // We just generate the OTP and tell the frontend to proceed to verification.
        
        // Generate Registration OTP
        String otp = generateOtp();
        com.financetracker.entity.OtpToken otpToken = com.financetracker.entity.OtpToken.builder()
                .email(requestDTO.getEmail())
                .otpCode(otp)
                .type(com.financetracker.entity.OtpToken.OtpType.REGISTRATION)
                .expiryTime(java.time.LocalDateTime.now().plusMinutes(15))
                .build();
        otpTokenRepository.save(otpToken);
        
        try {
            emailService.sendVerificationOtp(requestDTO.getEmail(), otp);
        } catch (Exception e) {
            System.err.println("Failed to send OTP email: " + e.getMessage());
            throw new ApiException("Email Error: " + e.getMessage(), 500);
        }

        return AuthResponseDTO.builder()
                .success(true)
                .message("Verification code sent to " + requestDTO.getEmail())
                .token(null)
                .user(null) // No user yet
                .build();
    }

    /**
     * Login user
     */
    public AuthResponseDTO login(AuthRequestDTO requestDTO) {
        try {
            // DEBUG: Manually check if user exists in DB before Spring Security tries
            User dbUser = userRepository.findByUsername(requestDTO.getUsername())
                .orElseGet(() -> userRepository.findByEmail(requestDTO.getUsername()).orElse(null));
                
            if (dbUser == null) {
                System.err.println("DEBUG LOGIN: User not found in database for input: " + requestDTO.getUsername());
            } else {
                System.err.println("DEBUG LOGIN: User found. ID=" + dbUser.getId() + ", Email=" + dbUser.getEmail() + ", Username=" + dbUser.getUsername());
                System.err.println("DEBUG LOGIN: DB Password Hash=" + dbUser.getPassword());
                System.err.println("DEBUG LOGIN: Passed Password=" + requestDTO.getPassword());
                System.err.println("DEBUG LOGIN: BCrypt matches? " + passwordEncoder.matches(requestDTO.getPassword(), dbUser.getPassword()));
            }

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            requestDTO.getUsername(),
                            requestDTO.getPassword()
                    )
            );

            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User user = userRepository.findById(userPrincipal.getId())
                    .orElseThrow(() -> new ApiException("User not found", 404));

            if (!Boolean.TRUE.equals(user.getEmailVerified())) {
                throw new ApiException("Please verify your email before logging in", 403, "UNVERIFIED_EMAIL");
            }

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

    public AuthResponseDTO verifyEmail(AuthRequestDTO registrationData, String otp) {
        String email = registrationData.getEmail();
        com.financetracker.entity.OtpToken otpToken = otpTokenRepository.findByEmailAndOtpCodeAndType(email, otp, com.financetracker.entity.OtpToken.OtpType.REGISTRATION)
                .orElseThrow(() -> new ApiException("Invalid or expired OTP", 400));

        if (otpToken.isExpired()) {
            throw new ApiException("OTP has expired", 400);
        }

        // Now that OTP is verified, create the user
        User user = User.builder()
                .email(registrationData.getEmail())
                .username(registrationData.getUsername())
                .password(passwordEncoder.encode(registrationData.getPassword()))
                .firstName(registrationData.getFirstName())
                .lastName(registrationData.getLastName())
                .country(registrationData.getCountry())
                .currency(registrationData.getCurrency() != null ? registrationData.getCurrency() : "INR")
                .role(User.UserRole.USER)
                .enabled(true)
                .emailVerified(true)
                .build();

        user = userRepository.save(user);

        // Create default categories
        List<Category> defaultCategories = Arrays.asList(
            Category.builder().name("Food").description("Groceries and dining out").color("#FF6B6B").icon("utensils").user(user).isCustom(false).build(),
            Category.builder().name("Housing").description("Rent, mortgage, and utilities").color("#4ECDC4").icon("home").user(user).isCustom(false).build(),
            Category.builder().name("Transportation").description("Gas, transit, and car maintenance").color("#45B7D1").icon("car").user(user).isCustom(false).build(),
            Category.builder().name("Entertainment").description("Movies, games, and fun").color("#F7B731").icon("film").user(user).isCustom(false).build(),
            Category.builder().name("Personal").description("Personal care and clothing").color("#5D62B5").icon("user").user(user).isCustom(false).build()
        );
        categoryRepository.saveAll(defaultCategories);

        otpTokenRepository.delete(otpToken);

        String token = jwtTokenProvider.generateTokenFromUsername(user.getUsername(), user.getEmail(), user.getRole().toString(), user.getId());

        return AuthResponseDTO.builder()
                .success(true)
                .message("Account created and email verified successfully")
                .token(token)
                .user(convertToDTO(user))
                .build();
    }

    public void resendOtp(String email, com.financetracker.entity.OtpToken.OtpType type) {
        // For password reset, we DO need a user. For registration, we don't (user is created after verification).
        if (type == com.financetracker.entity.OtpToken.OtpType.PASSWORD_RESET) {
            userRepository.findByEmail(email).orElseThrow(() -> new ApiException("User not found", 404));
        }
        
        // Clean up old ones
        otpTokenRepository.deleteByEmailAndType(email, type);

        String otp = generateOtp();
        com.financetracker.entity.OtpToken otpToken = com.financetracker.entity.OtpToken.builder()
                .email(email)
                .otpCode(otp)
                .type(type)
                .expiryTime(java.time.LocalDateTime.now().plusMinutes(15))
                .build();
        otpTokenRepository.save(otpToken);

        if (type == com.financetracker.entity.OtpToken.OtpType.REGISTRATION) {
            emailService.sendVerificationOtp(email, otp);
        } else {
            emailService.sendPasswordResetOtp(email, otp);
        }
    }

    public void forgotPassword(String email) {
        resendOtp(email, com.financetracker.entity.OtpToken.OtpType.PASSWORD_RESET);
    }

    public void resetPassword(String email, String otp, String newPassword) {
        com.financetracker.entity.OtpToken otpToken = otpTokenRepository.findByEmailAndOtpCodeAndType(email, otp, com.financetracker.entity.OtpToken.OtpType.PASSWORD_RESET)
                .orElseThrow(() -> new ApiException("Invalid or expired reset code", 400));

        if (otpToken.isExpired()) {
            throw new ApiException("Reset code has expired", 400);
        }

        // Validate password complexity
        if (newPassword == null || newPassword.length() < 8 || !newPassword.matches(".*[A-Z].*") || !newPassword.matches(".*[a-z].*") || !newPassword.matches(".*\\d.*") || !newPassword.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?].*")) {
            throw new ApiException("Password does not meet complexity requirements", 400, "WEAK_PASSWORD");
        }

        User user = userRepository.findByEmail(email).orElseThrow(() -> new ApiException("User not found", 404));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        otpTokenRepository.delete(otpToken);
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
                .country(user.getCountry())
                .createdAt(user.getCreatedAt().toString())
                .build();
    }
}
