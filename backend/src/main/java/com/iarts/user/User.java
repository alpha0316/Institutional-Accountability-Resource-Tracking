package com.iarts.user;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue
    private UUID id;

    /** Stable identifier from Aza's GET /oauth/userinfo.id. Null for users not yet linked (e.g. seeded before first login). */
    @Column(name = "aza_user_id", unique = true)
    private String azaUserId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Column(name = "school_id")
    private UUID schoolId;

    @Column(name = "supplier_id")
    private UUID supplierId;
}
