package com.careerpilot.modules.auth.dto;

import com.careerpilot.modules.auth.entity.Role;
import java.util.UUID;

public record UserSummary(UUID id, String fullName, String email, Role role) { }
