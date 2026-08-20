package com.careerpilot.modules.profile.entity;

import com.careerpilot.modules.auth.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Entity @Table(name = "user_skills") @Getter @Setter @NoArgsConstructor
public class UserSkill {
    @Id private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id") private User user;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "skill_id") private Skill skill;
    @Enumerated(EnumType.STRING) @Column(name = "proficiency_level", nullable = false, length = 30) private ProficiencyLevel proficiencyLevel;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 30) private SkillSource source;
    @Column(precision = 4, scale = 3) private BigDecimal confidence;
    @PrePersist void create() { if (id == null) id = UUID.randomUUID(); }
}
