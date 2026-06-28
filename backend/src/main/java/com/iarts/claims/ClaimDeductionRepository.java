package com.iarts.claims;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ClaimDeductionRepository extends JpaRepository<ClaimDeduction, UUID> {
    List<ClaimDeduction> findByClaimId(UUID claimId);
}
