package com.financetracker.service;

import com.financetracker.dto.AuthRequestDTO;
import com.financetracker.dto.AuthResponseDTO;
import com.financetracker.entity.User;
import com.financetracker.exception.ApiException;
import com.financetracker.repository.UserRepository;
import com.financetracker.repository.CategoryRepository;
import com.financetracker.security.JwtTokenProvider;
import com.financetracker.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AuthService
 * Tests user registration and login flows
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private AuthService authService;

    private AuthRequestDTO registerRequest;
    private AuthRequestDTO loginRequest;
    private User savedUser;

    @BeforeEach
    void setUp() {
        registerRequest = AuthRequestDTO.builder()
                .email("newuser@example.com")
                .username("newuser")
                .password("Password123!")
                .firstName("John")
                .lastName("Doe")
                .build();

        loginRequest = AuthRequestDTO.builder()
                .username("testuser")
                .password("Password123!")
                .build();

        savedUser = User.builder()
                .id(1L)
                .email("newuser@example.com")
                .username("newuser")
                .password("encodedPassword")
                .firstName("John")
                .lastName("Doe")
                .role(User.UserRole.USER)
                .enabled(true)
                .currency("USD")
                .build();

        try {
            var createdAt = User.class.getDeclaredField("createdAt");
            createdAt.setAccessible(true);
            createdAt.set(savedUser, LocalDateTime.now());
            var updatedAt = User.class.getDeclaredField("updatedAt");
            updatedAt.setAccessible(true);
            updatedAt.set(savedUser, LocalDateTime.now());
        } catch (Exception ignored) {}
    }

    // ===================== REGISTER =====================

    @Test
    @DisplayName("Should register user successfully")
    void register_WithValidData_ShouldSucceed() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtTokenProvider.generateTokenFromUsername(anyString(), anyString(), anyString(), anyLong()))
                .thenReturn("mock.jwt.token");

        AuthResponseDTO response = authService.register(registerRequest);

        assertThat(response.getSuccess()).isTrue();
        assertThat(response.getToken()).isEqualTo("mock.jwt.token");
        assertThat(response.getUser().getEmail()).isEqualTo("newuser@example.com");
        assertThat(response.getUser().getUsername()).isEqualTo("newuser");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when email already exists")
    void register_WithExistingEmail_ShouldThrowException() {
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Email already registered");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw exception when username already exists")
    void register_WithExistingUsername_ShouldThrowException() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByUsername(anyString())).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Username already taken");

        verify(userRepository, never()).save(any());
    }

    // ===================== LOGIN =====================

    @Test
    @DisplayName("Should login user successfully")
    void login_WithValidCredentials_ShouldSucceed() {
        UserPrincipal userPrincipal = UserPrincipal.create(savedUser);
        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(userPrincipal);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(auth);
        when(userRepository.findById(1L)).thenReturn(Optional.of(savedUser));
        when(jwtTokenProvider.generateToken(auth)).thenReturn("mock.jwt.login.token");

        AuthResponseDTO response = authService.login(loginRequest);

        assertThat(response.getSuccess()).isTrue();
        assertThat(response.getToken()).isEqualTo("mock.jwt.login.token");
        assertThat(response.getMessage()).isEqualTo("Login successful");
    }

    @Test
    @DisplayName("Should throw exception with invalid credentials")
    void login_WithInvalidCredentials_ShouldThrowException() {
        when(authenticationManager.authenticate(any()))
                .thenThrow(new RuntimeException("Bad credentials"));

        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Invalid username or password");
    }
}
