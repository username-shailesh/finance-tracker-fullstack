package com.financetracker.dto;

import lombok.*;
import java.math.BigDecimal;

/**
 * CategoryDTO - Data Transfer Object for Category
 * Used for API request/response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryDTO {
    private Long id;
    private String name;
    private String description;
    private String color;
    private String icon;
    private Boolean isCustom;
}
