package com.iarts.reimbursement;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ReimbursementClaimRepository extends JpaRepository<ReimbursementClaim, UUID> {
}
