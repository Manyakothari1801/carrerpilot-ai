package com.careerpilot.modules.profile.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity @Table(name = "skills") @Getter @Setter @NoArgsConstructor
public class Skill {
    @Id private UUID id;
    @Column(name = "normalized_name", nullable = false, unique = true, length = 120) private String normalizedName;
    @Column(name = "display_name", nullable = false, length = 120) private String displayName;
    @PrePersist void create() { if (id == null) id = UUID.randomUUID(); }
}
