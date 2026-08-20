package com.careerpilot.modules.profile.entity;

import com.careerpilot.modules.auth.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity @Table(name = "profiles") @Getter @Setter @NoArgsConstructor
public class Profile {
    @Id private UUID id;
    @OneToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id", unique = true) private User user;
    @Column(length = 30) private String phone;
    @Column(length = 160) private String college;
    @Column(length = 120) private String degree;
    @Column(name = "graduation_year") private Integer graduationYear;
    @Column(name = "target_role", length = 120) private String targetRole;
    @Enumerated(EnumType.STRING) @Column(name = "experience_level", length = 30) private ExperienceLevel experienceLevel;
    @Column(name = "github_url", length = 500) private String githubUrl;
    @Column(name = "linkedin_url", length = 500) private String linkedinUrl;
    @Column(length = 1000) private String bio;
    @Column(name = "profile_completion_percentage", nullable = false) private int profileCompletionPercentage;
    @Column(name = "created_at", nullable = false) private Instant createdAt;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;
    @PrePersist void create() { Instant now = Instant.now(); if (id == null) id = UUID.randomUUID(); createdAt = now; updatedAt = now; }
    @PreUpdate void update() { updatedAt = Instant.now(); }
}
