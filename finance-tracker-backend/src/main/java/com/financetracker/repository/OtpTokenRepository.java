package com.financetracker.repository;

import com.financetracker.entity.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {
    Optional<OtpToken> findByEmailAndOtpCodeAndType(String email, String otpCode, OtpToken.OtpType type);
    void deleteByEmailAndType(String email, OtpToken.OtpType type);
}
