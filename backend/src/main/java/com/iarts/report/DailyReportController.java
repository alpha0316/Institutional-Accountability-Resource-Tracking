package com.iarts.report;

import com.iarts.common.ApiException;
import com.iarts.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class DailyReportController {

    private final DailyReportRepository dailyReportRepository;

    @GetMapping
    public ApiResponse<List<DailyReportDto>> list() {
        return ApiResponse.of(dailyReportRepository.findAll().stream().map(DailyReportDto::from).toList());
    }

    @GetMapping("/{id}")
    public ApiResponse<DailyReportDto> get(@PathVariable UUID id) {
        DailyReport report = dailyReportRepository.findById(id).orElseThrow(() -> ApiException.notFound("Report not found"));
        return ApiResponse.of(DailyReportDto.from(report));
    }

    @PostMapping
    public ApiResponse<DailyReportDto> create(@Valid @RequestBody DailyReportRequest req) {
        DailyReport report = new DailyReport();
        apply(report, req);
        return ApiResponse.of(DailyReportDto.from(dailyReportRepository.save(report)), 201);
    }

    @PutMapping("/{id}")
    public ApiResponse<DailyReportDto> update(@PathVariable UUID id, @Valid @RequestBody DailyReportRequest req) {
        DailyReport report = dailyReportRepository.findById(id).orElseThrow(() -> ApiException.notFound("Report not found"));
        apply(report, req);
        return ApiResponse.of(DailyReportDto.from(dailyReportRepository.save(report)));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        dailyReportRepository.deleteById(id);
        return ApiResponse.of(null);
    }

    private void apply(DailyReport report, DailyReportRequest req) {
        report.setSchoolId(UUID.fromString(req.schoolId()));
        report.setSchoolName(req.schoolName());
        report.setReportDate(req.reportDate());
        report.setMealsServed(req.mealsServed());
        report.setEnrolledCount(req.enrolledCount());
        report.setFraudFlags(req.fraudFlags());
        report.setStatus(req.status() != null ? req.status() : ReportStatus.DRAFT);
    }
}
