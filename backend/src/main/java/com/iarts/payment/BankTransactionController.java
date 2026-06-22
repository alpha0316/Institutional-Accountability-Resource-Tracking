package com.iarts.payment;

import com.iarts.common.ApiException;
import com.iarts.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Read model for TransactionLog.tsx / AuditReport.tsx. The write path (pending -> released)
 * is rewired in Phase 3 to be driven by the Aza webhook instead of being set directly here.
 */
@RestController
@RequestMapping("/bank/transactions")
@RequiredArgsConstructor
public class BankTransactionController {

    private final BankTransactionRepository bankTransactionRepository;

    @GetMapping
    public ApiResponse<List<BankTransactionDto>> list() {
        return ApiResponse.of(bankTransactionRepository.findAll().stream().map(BankTransactionDto::from).toList());
    }

    @GetMapping("/{id}")
    public ApiResponse<BankTransactionDto> get(@PathVariable UUID id) {
        BankTransaction transaction = bankTransactionRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Transaction not found"));
        return ApiResponse.of(BankTransactionDto.from(transaction));
    }
}
