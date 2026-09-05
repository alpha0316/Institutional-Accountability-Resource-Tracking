package com.iarts.validation;

import com.iarts.common.ApiResponse;
import com.iarts.student.Card;
import com.iarts.student.CardRepository;
import com.iarts.student.EnrollmentStatus;
import com.iarts.student.Student;
import com.iarts.student.StudentRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

/**
 * Public, unauthenticated kiosk endpoint (no PrivateRoute guard on the frontend) —
 * the physical card tap is the only "auth" a student needs.
 */
@RestController
@RequestMapping("/scanner")
@RequiredArgsConstructor
public class ScannerController {

    private final CardRepository cardRepository;
    private final StudentRepository studentRepository;
    private final MealValidationRepository mealValidationRepository;

    @PostMapping("/scan")
    public ApiResponse<ScanResultResponse> scan(@Valid @RequestBody ScanRequest req) {
        Optional<Card> cardOpt = cardRepository.findByQrCode(req.qrCode());
        if (cardOpt.isEmpty() || !cardOpt.get().isActive()) {
            return rejectAndLog(req, req.qrCode(), "Unknown Card", "unknown_card");
        }
        Card card = cardOpt.get();

        Student student = studentRepository.findById(card.getStudentId()).orElse(null);
        if (student == null) {
            return rejectAndLog(req, req.qrCode(), "Unknown Card", "unknown_card");
        }
        if (student.getEnrollmentStatus() == EnrollmentStatus.INACTIVE) {
            return rejectAndLog(req, card.getCardNumber(), student.getFullName(), "inactive_student");
        }

        Instant startOfDay = LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant();
        boolean alreadyServedToday = mealValidationRepository
                .existsByCardNumberAndDiningHallIdAndServedTrueAndScanTimeAfter(
                        card.getCardNumber(), req.diningHallId(), startOfDay);

        MealValidation validation = new MealValidation();
        validation.setCardNumber(card.getCardNumber());
        validation.setStudentName(student.getFullName());
        validation.setDiningHallId(req.diningHallId());

        if (alreadyServedToday) {
            validation.setServed(false);
            validation.setDuplicate(true);
            validation.setFlagged(true);
            mealValidationRepository.save(validation);
            return ApiResponse.of(ScanResultResponse.of("duplicate_scan"));
        }

        validation.setServed(true);
        validation.setDuplicate(false);
        validation.setFlagged(false);
        mealValidationRepository.save(validation);
        return ApiResponse.of(ScanResultResponse.served(student.getFullName()));
    }

    /** Rejected scans are logged too — fraud/error visibility on the feed is the point of this system. */
    private ApiResponse<ScanResultResponse> rejectAndLog(ScanRequest req, String cardNumber, String studentName, String reason) {
        MealValidation validation = new MealValidation();
        validation.setCardNumber(cardNumber);
        validation.setStudentName(studentName);
        validation.setDiningHallId(req.diningHallId());
        validation.setServed(false);
        validation.setDuplicate(false);
        validation.setFlagged(true);
        validation.setRejectionReason(reason);
        mealValidationRepository.save(validation);
        return ApiResponse.of(ScanResultResponse.of(reason));
    }

    @GetMapping("/feed")
    public ApiResponse<List<MealValidationDto>> feed() {
        return ApiResponse.of(mealValidationRepository.findAllByOrderByScanTimeDesc()
                .stream().map(MealValidationDto::from).toList());
    }
}
