package com.careerpilot.modules.profile.dto;

import com.careerpilot.modules.profile.entity.ExperienceLevel;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ProfileUpdateRequest(
        @Size(max = 120) String fullName,
        @Size(max = 30) String phone,
        @Size(max = 160) String college,
        @Size(max = 120) String degree,
        @Min(1950) @Max(2200) Integer graduationYear,
        @Size(max = 120) String targetRole,
        ExperienceLevel experienceLevel,
        @Pattern(regexp = "^$|https://github\\.com/.+", message = "must be a valid GitHub URL") @Size(max = 500) String githubUrl,
        @Pattern(regexp = "^$|https://([a-z]{2,3}\\.)?linkedin\\.com/.+", message = "must be a valid LinkedIn URL") @Size(max = 500) String linkedinUrl,
        @Size(max = 1000) String bio) { }
