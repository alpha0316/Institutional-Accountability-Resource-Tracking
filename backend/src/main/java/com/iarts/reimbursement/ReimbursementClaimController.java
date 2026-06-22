package com.iarts.reimbursement;

import com.iarts.common.ApiException;
import com.iarts.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/reimbursements")
@RequiredArgsConstructor
public class ReimbursementClaimController {

    private final ReimbursementClaimRepository reimbursementClaimRepository;

    @GetMapping
    public ApiResponse<List<ReimbursementClaimDto>> list() {
        return ApiResponse.of(reimbursementClaimRepository.findAll().stream().map(ReimbursementClaimDto::from).toList());
    }

    @GetMapping("/{id}")
    public ApiResponse<ReimbursementClaimDto> get(@PathVariable UUID id) {
        ReimbursementClaim claim = reimbursementClaimRepository.findById(id).orElseThrow(() -> ApiException.notFound("Claim not found"));
        return ApiResponse.of(ReimbursementClaimDto.from(claim));
    }

    @PostMapping
    public ApiResponse<ReimbursementClaimDto> create(@Valid @RequestBody ReimbursementClaimRequest req) {
        ReimbursementClaim claim = new ReimbursementClaim();
        apply(claim, req);
        return ApiResponse.of(ReimbursementClaimDto.from(reimbursementClaimRepository.save(claim)), 201);
    }

    @PutMapping("/{id}")
    public ApiResponse<ReimbursementClaimDto> update(@PathVariable UUID id, @Valid @RequestBody ReimbursementClaimRequest req) {
        ReimbursementClaim claim = reimbursementClaimRepository.findById(id).orElseThrow(() -> ApiException.notFound("Claim not found"));
        apply(claim, req);
        return ApiResponse.of(ReimbursementClaimDto.from(reimbursementClaimRepository.save(claim)));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        reimbursementClaimRepository.deleteById(id);
        return ApiResponse.of(null);
    }

    private void apply(ReimbursementClaim claim, ReimbursementClaimRequest req) {
        claim.setReportId(UUID.fromString(req.reportId()));
        claim.setInstitutionName(req.institutionName());
        claim.setAmountClaimed(req.amountClaimed());
        claim.setAmountApproved(req.amountApproved());
        claim.setStatus(req.status() != null ? req.status() : ReimbursementStatus.PENDING);
    }
}
