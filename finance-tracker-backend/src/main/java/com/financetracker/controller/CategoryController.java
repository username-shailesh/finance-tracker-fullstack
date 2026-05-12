package com.financetracker.controller;

import com.financetracker.dto.CategoryDTO;
import com.financetracker.entity.User;
import com.financetracker.security.UserPrincipal;
import com.financetracker.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * CategoryController - Handles category endpoints
 */
@RestController
@RequestMapping("/categories")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    /**
     * Get all categories for user
     */
    @GetMapping
    public ResponseEntity<?> getCategories(@AuthenticationPrincipal UserPrincipal principal) {
        try {
            User user = new User();
            user.setId(principal.getId());
            List<CategoryDTO> categories = categoryService.getUserCategories(user);
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * Create a new category
     */
    @PostMapping
    public ResponseEntity<?> createCategory(@RequestBody CategoryDTO categoryDTO,
                                           @AuthenticationPrincipal UserPrincipal principal) {
        try {
            User user = new User();
            user.setId(principal.getId());
            CategoryDTO created = categoryService.createCategory(categoryDTO, user);
            return ResponseEntity.status(201).body(created);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * Update a category
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Long id,
                                           @RequestBody CategoryDTO categoryDTO,
                                           @AuthenticationPrincipal UserPrincipal principal) {
        try {
            User user = new User();
            user.setId(principal.getId());
            CategoryDTO updated = categoryService.updateCategory(id, categoryDTO, user);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * Delete a category
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id,
                                           @AuthenticationPrincipal UserPrincipal principal) {
        try {
            User user = new User();
            user.setId(principal.getId());
            categoryService.deleteCategory(id, user);
            return ResponseEntity.ok(createSuccessResponse("Category deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(createErrorResponse(e.getMessage()));
        }
    }

    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return response;
    }

    private Map<String, Object> createSuccessResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        return response;
    }
}
