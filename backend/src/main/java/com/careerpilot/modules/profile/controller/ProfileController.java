package com.careerpilot.modules.profile.controller;

import com.careerpilot.modules.profile.dto.*;
import com.careerpilot.modules.profile.service.ProfileService;
import com.careerpilot.security.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/v1/profile")
public class ProfileController {
    private final ProfileService profiles;
    public ProfileController(ProfileService profiles) { this.profiles = profiles; }
    @GetMapping public ProfileResponse get() { return profiles.get(CurrentUser.require()); }
    @PutMapping public ProfileResponse replace(@Valid @RequestBody ProfileUpdateRequest request) { return profiles.update(CurrentUser.require(), request, true); }
    @PatchMapping public ProfileResponse patch(@Valid @RequestBody ProfileUpdateRequest request) { return profiles.update(CurrentUser.require(), request, false); }
    @GetMapping("/skills") public List<UserSkillResponse> skills() { return profiles.getSkills(CurrentUser.require()); }
    @PutMapping("/skills") public List<UserSkillResponse> updateSkills(@Valid @RequestBody SkillsUpdateRequest request) { return profiles.updateSkills(CurrentUser.require(), request); }
}
