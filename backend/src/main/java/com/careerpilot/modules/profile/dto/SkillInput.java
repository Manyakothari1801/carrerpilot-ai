package com.careerpilot.modules.profile.dto;

import com.careerpilot.modules.profile.entity.ProficiencyLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SkillInput(@NotBlank @Size(max = 120) String displayName, @NotNull ProficiencyLevel proficiencyLevel) { }
