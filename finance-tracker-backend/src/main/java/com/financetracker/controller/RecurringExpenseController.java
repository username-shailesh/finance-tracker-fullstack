package com.financetracker.controller;

import com.financetracker.dto.ProcessResultDTO;
import com.financetracker.dto.RecurringExpenseDTO;
import com.financetracker.entity.Category;
import com.financetracker.entity.RecurringExpense;
import com.financetracker.entity.User;
import com.financetracker.repository.CategoryRepository;
import com.financetracker.security.UserPrincipal;
import com.financetracker.service.RecurringExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/recurring")
@CrossOrigin(origins = "*")
public class RecurringExpenseController {

    @Autowired
    private RecurringExpenseService recurringExpenseService;

    @Autowired
    private CategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<?> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        User user = new User();
        user.setId(principal.getId());
        List<RecurringExpenseDTO> list = recurringExpenseService.getUserRecurringExpenses(user)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody RecurringExpenseDTO dto, @AuthenticationPrincipal UserPrincipal principal) {
        try {
            User user = new User();
            user.setId(principal.getId());
            
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));

            RecurringExpense recurring = RecurringExpense.builder()
                    .name(dto.getName())
                    .description(dto.getDescription())
                    .amount(dto.getAmount())
                    .user(user)
                    .category(category)
                    .recurrenceType(RecurringExpense.RecurrenceType.valueOf(dto.getFrequency()))
                    .startDate(dto.getStartDate() != null ? dto.getStartDate() : java.time.LocalDate.now())
                    .dayOfMonth(dto.getStartDate() != null ? dto.getStartDate().getDayOfMonth() : java.time.LocalDate.now().getDayOfMonth())
                    .isActive(true)
                    .build();

            RecurringExpense saved = recurringExpenseService.save(recurring);
            // Re-fetch to ensure category is loaded for DTO conversion
            saved = recurringExpenseService.getById(saved.getId());
            return ResponseEntity.status(201).body(convertToDTO(saved));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(createErrorResponse(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody RecurringExpenseDTO dto, @AuthenticationPrincipal UserPrincipal principal) {
        try {
            RecurringExpense recurring = recurringExpenseService.getById(id);
            if (recurring == null) return ResponseEntity.status(404).body(createErrorResponse("Not found"));

            recurring.setName(dto.getName());
            recurring.setAmount(dto.getAmount());
            recurring.setDescription(dto.getDescription());
            recurring.setRecurrenceType(RecurringExpense.RecurrenceType.valueOf(dto.getFrequency()));
            
            if (dto.getCategoryId() != null) {
                Category category = categoryRepository.findById(dto.getCategoryId()).orElse(null);
                if (category != null) recurring.setCategory(category);
            }

            RecurringExpense saved = recurringExpenseService.save(recurring);
            // Re-fetch to ensure category is loaded for DTO conversion
            saved = recurringExpenseService.getById(saved.getId());
            return ResponseEntity.ok(convertToDTO(saved));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(createErrorResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        recurringExpenseService.delete(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<?> toggle(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        try {
            RecurringExpense toggled = recurringExpenseService.toggleActive(id);
            if (toggled == null) {
                return ResponseEntity.status(404).body(createErrorResponse("Recurring expense not found"));
            }
            return ResponseEntity.ok(convertToDTO(toggled));
        } catch (Exception e) {
            e.printStackTrace(); // Log the actual error for debugging
            return ResponseEntity.status(500).body(createErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/process")
    public ResponseEntity<?> processNow() {
        ProcessResultDTO result = recurringExpenseService.processRecurringExpenses();
        return ResponseEntity.ok(result);
    }

    private RecurringExpenseDTO convertToDTO(RecurringExpense entity) {
        return RecurringExpenseDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .amount(entity.getAmount())
                .categoryId(entity.getCategory().getId())
                .categoryName(entity.getCategory().getName())
                .frequency(entity.getRecurrenceType().name())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .isActive(entity.getIsActive())
                .lastProcessedDate(entity.getLastProcessedDate())
                .nextDueDate(recurringExpenseService.getNextExpenseDate(entity))
                .build();
    }

    private Map<String, Object> createErrorResponse(String message) {
        return Map.of("success", false, "message", message);
    }
}
