package com.careerpilot.modules.profile.dto;

import com.careerpilot.modules.profile.entity.ProficiencyLevel;
import com.careerpilot.modules.profile.entity.SkillSource;
import java.math.BigDecimal;
import java.util.UUID;

public record UserSkillResponse(UUID id, UUID skillId, String displayName, ProficiencyLevel proficiencyLevel,
                                SkillSource source, BigDecimal confidence) { }
