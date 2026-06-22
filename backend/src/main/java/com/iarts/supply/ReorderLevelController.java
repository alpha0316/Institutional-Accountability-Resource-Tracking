package com.iarts.supply;

import com.iarts.common.ApiException;
import com.iarts.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/reorder-levels")
@RequiredArgsConstructor
public class ReorderLevelController {

    private final ReorderLevelRepository reorderLevelRepository;

    @GetMapping
    public ApiResponse<List<ReorderLevelDto>> list() {
        return ApiResponse.of(reorderLevelRepository.findAll().stream().map(ReorderLevelDto::from).toList());
    }

    @PostMapping
    public ApiResponse<ReorderLevelDto> create(@Valid @RequestBody ReorderLevelRequest req) {
        ReorderLevel level = new ReorderLevel();
        apply(level, req);
        return ApiResponse.of(ReorderLevelDto.from(reorderLevelRepository.save(level)), 201);
    }

    @PutMapping("/{id}")
    public ApiResponse<ReorderLevelDto> update(@PathVariable UUID id, @Valid @RequestBody ReorderLevelRequest req) {
        ReorderLevel level = reorderLevelRepository.findById(id).orElseThrow(() -> ApiException.notFound("Reorder level not found"));
        apply(level, req);
        return ApiResponse.of(ReorderLevelDto.from(reorderLevelRepository.save(level)));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        reorderLevelRepository.deleteById(id);
        return ApiResponse.of(null);
    }

    private void apply(ReorderLevel level, ReorderLevelRequest req) {
        level.setItemType(req.itemType());
        level.setUnit(req.unit());
        level.setCurrentStock(req.currentStock());
        level.setMinStock(req.minStock());
        level.setStatus(req.status() != null ? req.status() : ReorderStatus.OK);
    }
}
