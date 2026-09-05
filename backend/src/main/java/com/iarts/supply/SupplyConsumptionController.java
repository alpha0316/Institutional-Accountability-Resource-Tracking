package com.iarts.supply;

import com.iarts.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/supply-consumptions")
@RequiredArgsConstructor
public class SupplyConsumptionController {

    private final SupplyConsumptionRepository consumptionRepository;

    @GetMapping
    public ApiResponse<List<SupplyConsumptionDto>> list(@RequestParam(required = false) UUID schoolId) {
        List<SupplyConsumption> consumptions = schoolId != null
                ? consumptionRepository.findBySchoolIdOrderByConsumedAtDesc(schoolId)
                : consumptionRepository.findAllByOrderByConsumedAtDesc();
        return ApiResponse.of(consumptions.stream().map(SupplyConsumptionDto::from).toList());
    }

    @PostMapping
    public ApiResponse<SupplyConsumptionDto> create(@Valid @RequestBody SupplyConsumptionRequest req) {
        SupplyConsumption consumption = new SupplyConsumption();
        consumption.setSchoolId(UUID.fromString(req.schoolId()));
        consumption.setItemType(req.itemType());
        consumption.setQuantity(req.quantity());
        consumption.setUnit(req.unit());
        consumption.setMealSession(req.mealSession());
        consumption.setStudentsServed(req.studentsServed());
        return ApiResponse.of(SupplyConsumptionDto.from(consumptionRepository.save(consumption)), 201);
    }
}
