package com.careerpilot.modules.profile.dto;

import com.careerpilot.modules.profile.entity.ExperienceLevel;
import java.util.List;
import java.util.UUID;

public record ProfileResponse(UUID id, String fullName, String email, String phone, String college, String degree,
                              Integer graduationYear, String targetRole, ExperienceLevel experienceLevel,
                              String githubUrl, String linkedinUrl, String bio,
                              int profileCompletionPercentage, List<String> missingFields) { }
