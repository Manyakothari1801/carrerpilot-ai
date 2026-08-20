package com.careerpilot.security;

import com.careerpilot.config.SecurityProperties;
import com.careerpilot.modules.auth.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {
    private final SecurityProperties properties;
    private final SecretKey key;

    public JwtService(SecurityProperties properties) {
        this.properties = properties;
        if (properties.jwtSecret() == null || properties.jwtSecret().length() < 32) {
            throw new IllegalStateException("JWT_SECRET must contain at least 32 characters");
        }
        this.key = Keys.hmacShaKeyFor(properties.jwtSecret().getBytes(StandardCharsets.UTF_8));
    }

    public TokenValue createAccessToken(User user) {
        Instant issued = Instant.now();
        Instant expires = issued.plus(properties.accessExpiration());
        String token = Jwts.builder().subject(user.getId().toString()).claim("role", user.getRole().name())
                .issuedAt(Date.from(issued)).expiration(Date.from(expires)).signWith(key).compact();
        return new TokenValue(token, expires);
    }

    public UUID parseUserId(String token) {
        Claims claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
        return UUID.fromString(claims.getSubject());
    }

    public record TokenValue(String value, Instant expiresAt) { }
}
