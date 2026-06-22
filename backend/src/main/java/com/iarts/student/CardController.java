package com.iarts.student;

import com.iarts.common.ApiException;
import com.iarts.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/cards")
@RequiredArgsConstructor
public class CardController {

    private final CardRepository cardRepository;

    @GetMapping
    public ApiResponse<List<CardDto>> list(@RequestParam(required = false) String studentId) {
        List<Card> cards = studentId != null
                ? cardRepository.findByStudentId(UUID.fromString(studentId))
                : cardRepository.findAll();
        return ApiResponse.of(cards.stream().map(CardDto::from).toList());
    }

    @PostMapping
    public ApiResponse<CardDto> create(@Valid @RequestBody CardRequest req) {
        Card card = new Card();
        apply(card, req);
        return ApiResponse.of(CardDto.from(cardRepository.save(card)), 201);
    }

    @PutMapping("/{id}")
    public ApiResponse<CardDto> update(@PathVariable UUID id, @Valid @RequestBody CardRequest req) {
        Card card = cardRepository.findById(id).orElseThrow(() -> ApiException.notFound("Card not found"));
        apply(card, req);
        return ApiResponse.of(CardDto.from(cardRepository.save(card)));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        cardRepository.deleteById(id);
        return ApiResponse.of(null);
    }

    private void apply(Card card, CardRequest req) {
        card.setStudentId(UUID.fromString(req.studentId()));
        card.setCardNumber(req.cardNumber());
        card.setQrCode(req.qrCode());
        card.setActive(req.isActive());
    }
}
