package com.ledgerline.config;

import com.ledgerline.entity.*;
import com.ledgerline.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            AccountRepository accountRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return; // Seed data already exists
        }

        String encodedPassword = passwordEncoder.encode("Password123!");

        // 1. Seed Users
        User admin = userRepository.save(new User("admin", "admin@ledgerline.internal", encodedPassword, Role.ROLE_ADMIN));
        User auditor = userRepository.save(new User("auditor", "auditor@ledgerline.internal", encodedPassword, Role.ROLE_AUDITOR));
        User alice = userRepository.save(new User("alice", "alice@example.com", encodedPassword, Role.ROLE_USER));
        User bob = userRepository.save(new User("bob", "bob@example.com", encodedPassword, Role.ROLE_USER));

        // 2. Seed Accounts
        accountRepository.save(new Account(admin, "SYS-RESERVE-001", AccountType.SYSTEM_RESERVE, new BigDecimal("100000.00"), "USD"));
        accountRepository.save(new Account(alice, "ACC-ALICE-101", AccountType.USER_CHECKING, new BigDecimal("1000.00"), "USD"));
        accountRepository.save(new Account(bob, "ACC-BOB-202", AccountType.USER_CHECKING, new BigDecimal("500.00"), "USD"));
    }
}

