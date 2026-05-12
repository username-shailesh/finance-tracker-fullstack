package com.financetracker.repository;

import com.financetracker.entity.Category;
import com.financetracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * CategoryRepository - Handles database operations for Category entity
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByUser(User user);
    Optional<Category> findByUserAndName(User user, String name);
    List<Category> findByUserAndIsCustom(User user, Boolean isCustom);
}
