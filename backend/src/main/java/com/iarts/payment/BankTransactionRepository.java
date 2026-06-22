package com.iarts.payment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface BankTransactionRepository extends JpaRepository<BankTransaction, UUID> {
}
