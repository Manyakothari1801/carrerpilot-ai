package com.careerpilot.modules.profile.controller;

import com.careerpilot.modules.profile.dto.SkillSearchResponse;
import com.careerpilot.modules.profile.service.ProfileService;
import jakarta.validation.constraints.Size;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Validated @RestController @RequestMapping("/api/v1/skills")
public class SkillController {
    private final ProfileService profiles;
    public SkillController(ProfileService profiles) { this.profiles = profiles; }
    @GetMapping("/search") public List<SkillSearchResponse> search(@RequestParam(defaultValue = "") @Size(max = 120) String q) { return profiles.search(q); }
}
