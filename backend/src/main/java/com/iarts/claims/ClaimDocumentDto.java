package com.iarts.claims;

public record ClaimDocumentDto(String name, String type) {
    public static ClaimDocumentDto from(ClaimDocument d) {
        return new ClaimDocumentDto(d.getName(), d.getType());
    }
}
