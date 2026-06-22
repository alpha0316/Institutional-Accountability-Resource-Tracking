package com.iarts.common;

import org.springframework.data.domain.Page;

import java.util.List;

public record PageResponse<T>(List<T> data, long total, int page, int perPage) {

    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(page.getContent(), page.getTotalElements(), page.getNumber(), page.getSize());
    }
}
