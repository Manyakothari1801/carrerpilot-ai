package com.careerpilot.modules.profile.repository;

import com.careerpilot.modules.profile.entity.UserSkill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface UserSkillRepository extends JpaRepository<UserSkill, UUID> {
    List<UserSkill> findByUserIdOrderBySkillDisplayName(UUID userId);
    long countByUserId(UUID userId);
    void deleteByUserId(UUID userId);
}
