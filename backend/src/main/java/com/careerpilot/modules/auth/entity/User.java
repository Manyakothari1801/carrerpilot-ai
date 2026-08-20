package com.careerpilot.modules.auth.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Entity @Table(name = "users") @Getter @Setter @NoArgsConstructor
public class User implements UserDetails {
    @Id private UUID id;
    @Column(name = "full_name", nullable = false, length = 120) private String fullName;
    @Column(nullable = false, unique = true, length = 320) private String email;
    @Column(name = "password_hash", nullable = false, length = 100) private String passwordHash;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 30) private Role role;
    @Enumerated(EnumType.STRING) @Column(name = "account_status", nullable = false, length = 30) private AccountStatus accountStatus;
    @Column(name = "email_verified", nullable = false) private boolean emailVerified;
    @Column(name = "created_at", nullable = false) private Instant createdAt;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;
    @Version private long version;

    @PrePersist void create() { Instant now = Instant.now(); createdAt = now; updatedAt = now; if (id == null) id = UUID.randomUUID(); }
    @PreUpdate void update() { updatedAt = Instant.now(); }

    @Override public Collection<? extends GrantedAuthority> getAuthorities() { return List.of(new SimpleGrantedAuthority("ROLE_" + role.name())); }
    @Override public String getPassword() { return passwordHash; }
    @Override public String getUsername() { return email; }
    @Override public boolean isAccountNonLocked() { return accountStatus != AccountStatus.LOCKED; }
    @Override public boolean isEnabled() { return accountStatus == AccountStatus.ACTIVE; }
}
