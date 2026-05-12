package com.financetracker.repository;

import com.financetracker.entity.RecurringExpense;
import com.financetracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * RecurringExpenseRepository - Handles database operations for RecurringExpense entity
 */
@Repository
public interface RecurringExpenseRepository extends JpaRepository<RecurringExpense, Long> {

    @Query("SELECT r FROM RecurringExpense r JOIN FETCH r.category JOIN FETCH r.user WHERE r.user = :user")
    List<RecurringExpense> findByUser(@Param("user") User user);

    List<RecurringExpense> findByUserAndIsActive(User user, Boolean isActive);

    @Query("SELECT r FROM RecurringExpense r JOIN FETCH r.category JOIN FETCH r.user WHERE r.id = :id")
    Optional<RecurringExpense> findByIdWithDetails(@Param("id") Long id);
}

