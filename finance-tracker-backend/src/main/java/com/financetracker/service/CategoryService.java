package com.financetracker.service;

import com.financetracker.dto.CategoryDTO;
import com.financetracker.entity.Category;
import com.financetracker.entity.User;
import com.financetracker.exception.ResourceNotFoundException;
import com.financetracker.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

/**
 * CategoryService - Handles category operations
 */
@Service
@Transactional
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    /**
     * Get all categories for a user
     */
    public List<CategoryDTO> getUserCategories(User user) {
        return categoryRepository.findByUser(user)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Create a new category
     */
    public CategoryDTO createCategory(CategoryDTO dto, User user) {
        Category category = Category.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .color(dto.getColor() != null ? dto.getColor() : "#FF6B6B")
                .icon(dto.getIcon() != null ? dto.getIcon() : "folder")
                .user(user)
                .isCustom(true)
                .build();

        category = categoryRepository.save(category);
        return convertToDTO(category);
    }

    /**
     * Update a category
     */
    public CategoryDTO updateCategory(Long categoryId, CategoryDTO dto, User user) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (!category.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Category not found for this user");
        }

        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        if (dto.getColor() != null) category.setColor(dto.getColor());
        if (dto.getIcon() != null) category.setIcon(dto.getIcon());

        category = categoryRepository.save(category);
        return convertToDTO(category);
    }

    /**
     * Delete a category
     */
    public void deleteCategory(Long categoryId, User user) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (!category.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Category not found for this user");
        }

        categoryRepository.delete(category);
    }

    /**
     * Convert Category entity to DTO
     */
    private CategoryDTO convertToDTO(Category category) {
        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .color(category.getColor())
                .icon(category.getIcon())
                .isCustom(category.getIsCustom())
                .build();
    }
}
