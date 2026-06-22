package com.iarts.auth;

import com.iarts.user.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey key;
    private final long expiryHours;

    public JwtService(@Value("${iarts.jwt.secret}") String secret,
                       @Value("${iarts.jwt.expiry-hours}") long expiryHours) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expiryHours = expiryHours;
    }

    public String issue(User user) {
        Instant now = Instant.now();
        var builder = Jwts.builder()
                .subject(user.getId().toString())
                .claim("role", user.getRole().toJson())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(Duration.ofHours(expiryHours))));
        if (user.getSchoolId() != null) builder.claim("schoolId", user.getSchoolId().toString());
        if (user.getSupplierId() != null) builder.claim("supplierId", user.getSupplierId().toString());
        return builder.signWith(key).compact();
    }

    public Claims parse(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }
}
