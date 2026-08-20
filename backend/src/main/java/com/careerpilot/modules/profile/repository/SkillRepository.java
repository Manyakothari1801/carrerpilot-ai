package com.careerpilot.modules.profile.repository;

import com.careerpilot.modules.profile.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SkillRepository extends JpaRepository<Skill, UUID> {
    Optional<Skill> findByNormalizedName(String normalizedName);
    List<Skill> findTop20ByNormalizedNameContainingOrderByDisplayName(String query);
}
