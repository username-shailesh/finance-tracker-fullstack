package com.financetracker.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.financetracker.dto.AuthRequestDTO;
import com.financetracker.dto.AuthResponseDTO;
import com.financetracker.dto.UserDTO;
import com.financetracker.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for AuthController
 * Tests REST API endpoints for authentication
 */
@WebMvcTest(
    value = AuthController.class,
    excludeAutoConfiguration = {
        org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class
    }
)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    private AuthRequestDTO validRegisterRequest;
    private AuthRequestDTO validLoginRequest;
    private AuthResponseDTO successResponse;

    @BeforeEach
    void setUp() {
        validRegisterRequest = AuthRequestDTO.builder()
                .email("test@example.com")
                .username("testuser")
                .password("Password123!")
                .firstName("John")
                .lastName("Doe")
                .build();

        validLoginRequest = AuthRequestDTO.builder()
                .username("testuser")
                .password("Password123!")
                .build();

        UserDTO userDTO = UserDTO.builder()
                .id(1L)
                .email("test@example.com")
                .username("testuser")
                .firstName("John")
                .lastName("Doe")
                .role("USER")
                .currency("USD")
                .createdAt("2024-01-01T00:00:00")
                .build();

        successResponse = AuthResponseDTO.builder()
                .success(true)
                .message("Success")
                .token("mock.jwt.token")
                .user(userDTO)
                .build();
    }

    @Test
    @DisplayName("POST /auth/register - should register user and return 200")
    void register_WithValidData_ShouldReturn200() throws Exception {
        when(authService.register(any(AuthRequestDTO.class))).thenReturn(successResponse);

        mockMvc.perform(post("/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRegisterRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.token").value("mock.jwt.token"))
                .andExpect(jsonPath("$.user.email").value("test@example.com"));
    }

    @Test
    @DisplayName("POST /auth/login - should authenticate and return token")
    void login_WithValidCredentials_ShouldReturn200() throws Exception {
        when(authService.login(any(AuthRequestDTO.class))).thenReturn(successResponse);

        mockMvc.perform(post("/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validLoginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.token").exists());
    }

    @Test
    @DisplayName("GET /auth/health - should return OK status")
    void health_ShouldReturn200() throws Exception {
        mockMvc.perform(get("/auth/health"))
                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("OK"));
    }

    @Test
    @DisplayName("POST /auth/register - should return 400 when service throws exception")
    void register_WhenServiceThrows_ShouldReturn400() throws Exception {
        when(authService.register(any(AuthRequestDTO.class)))
                .thenThrow(new RuntimeException("Email already registered"));

        mockMvc.perform(post("/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRegisterRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }
}
