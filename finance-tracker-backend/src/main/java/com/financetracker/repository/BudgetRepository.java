package com.financetracker.repository;

import com.financetracker.entity.Budget;
import com.financetracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * BudgetRepository - Handles database operations for Budget entity
 */
@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUser(User user);
    List<Budget> findByUserAndMonth(User user, String month);
    Optional<Budget> findByUserAndCategoryIdAndMonth(User user, Long categoryId, String month);
}
