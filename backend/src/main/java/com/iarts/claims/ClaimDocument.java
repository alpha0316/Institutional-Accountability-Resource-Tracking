package com.iarts.claims;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

/** Metadata only — no real file upload/storage in this pass. */
@Entity
@Table(name = "claim_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ClaimDocument {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "claim_id", nullable = false)
    private UUID claimId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type;
}
