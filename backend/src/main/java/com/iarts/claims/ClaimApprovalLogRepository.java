package com.iarts.claims;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ClaimApprovalLogRepository extends JpaRepository<ClaimApprovalLog, UUID> {
    List<ClaimApprovalLog> findByClaimIdOrderByCreatedAtAsc(UUID claimId);
}
