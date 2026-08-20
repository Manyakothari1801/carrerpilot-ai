package com.careerpilot.modules.profile.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record SkillsUpdateRequest(@NotNull @Size(max = 50) List<@Valid SkillInput> skills) { }
