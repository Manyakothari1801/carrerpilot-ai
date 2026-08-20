package com.careerpilot.modules.profile.service;

import com.careerpilot.exception.NotFoundException;
import com.careerpilot.modules.auth.entity.User;
import com.careerpilot.modules.auth.repository.UserRepository;
import com.careerpilot.modules.profile.dto.*;
import com.careerpilot.modules.profile.entity.*;
import com.careerpilot.modules.profile.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
public class ProfileService {
    private final ProfileRepository profiles; private final UserRepository users; private final SkillRepository skills;
    private final UserSkillRepository userSkills;
    public ProfileService(ProfileRepository profiles, UserRepository users, SkillRepository skills, UserSkillRepository userSkills) {
        this.profiles=profiles; this.users=users; this.skills=skills; this.userSkills=userSkills;
    }

    @Transactional(readOnly = true) public ProfileResponse get(User user) { return response(requireProfile(user), user); }

    @Transactional public ProfileResponse update(User authenticated, ProfileUpdateRequest request, boolean replace) {
        User user = users.findById(authenticated.getId()).orElseThrow(() -> new NotFoundException("User not found"));
        Profile profile = requireProfile(user);
        if (request.fullName() != null) user.setFullName(clean(request.fullName()));
        else if (replace) throw new com.careerpilot.exception.ApiException(org.springframework.http.HttpStatus.BAD_REQUEST, "Full name is required");
        profile.setPhone(value(request.phone(), profile.getPhone(), replace)); profile.setCollege(value(request.college(), profile.getCollege(), replace));
        profile.setDegree(value(request.degree(), profile.getDegree(), replace)); profile.setGraduationYear(request.graduationYear() != null || replace ? request.graduationYear() : profile.getGraduationYear());
        profile.setTargetRole(value(request.targetRole(), profile.getTargetRole(), replace));
        profile.setExperienceLevel(request.experienceLevel() != null || replace ? request.experienceLevel() : profile.getExperienceLevel());
        profile.setGithubUrl(value(request.githubUrl(), profile.getGithubUrl(), replace)); profile.setLinkedinUrl(value(request.linkedinUrl(), profile.getLinkedinUrl(), replace));
        profile.setBio(value(request.bio(), profile.getBio(), replace)); recalculate(profile, user);
        return response(profile, user);
    }

    @Transactional(readOnly = true) public List<UserSkillResponse> getSkills(User user) {
        return userSkills.findByUserIdOrderBySkillDisplayName(user.getId()).stream().map(this::skillResponse).toList();
    }

    @Transactional public List<UserSkillResponse> updateSkills(User authenticated, SkillsUpdateRequest request) {
        User user = users.findById(authenticated.getId()).orElseThrow(() -> new NotFoundException("User not found"));
        LinkedHashMap<String, SkillInput> canonical = new LinkedHashMap<>();
        for (SkillInput input : request.skills()) {
            String normalized = normalizeSkill(input.displayName());
            if (normalized.isBlank()) throw new com.careerpilot.exception.ApiException(org.springframework.http.HttpStatus.BAD_REQUEST, "Skill name cannot be empty");
            canonical.put(normalized, input);
        }
        userSkills.deleteByUserId(user.getId()); userSkills.flush();
        for (Map.Entry<String, SkillInput> entry : canonical.entrySet()) {
            Skill skill = skills.findByNormalizedName(entry.getKey()).orElseGet(() -> {
                Skill created = new Skill(); created.setNormalizedName(entry.getKey()); created.setDisplayName(clean(entry.getValue().displayName())); return skills.save(created);
            });
            UserSkill link = new UserSkill(); link.setUser(user); link.setSkill(skill); link.setProficiencyLevel(entry.getValue().proficiencyLevel());
            link.setSource(SkillSource.PROFILE); link.setConfidence(BigDecimal.ONE); userSkills.save(link);
        }
        Profile profile = requireProfile(user); recalculate(profile, user);
        return getSkills(user);
    }

    @Transactional(readOnly = true) public List<SkillSearchResponse> search(String query) {
        String normalized = normalizeSkill(query == null ? "" : query);
        if (normalized.isBlank()) return List.of();
        return skills.findTop20ByNormalizedNameContainingOrderByDisplayName(normalized).stream().map(s -> new SkillSearchResponse(s.getId(), s.getDisplayName())).toList();
    }

    private Profile requireProfile(User user) { return profiles.findByUserId(user.getId()).orElseThrow(() -> new NotFoundException("Student profile not found")); }
    private void recalculate(Profile profile, User user) { profile.setProfileCompletionPercentage(completion(profile, user).percentage()); }
    private Completion completion(Profile p, User u) {
        LinkedHashMap<String, Boolean> fields = new LinkedHashMap<>();
        fields.put("fullName", present(u.getFullName())); fields.put("phone", present(p.getPhone())); fields.put("college", present(p.getCollege()));
        fields.put("degree", present(p.getDegree())); fields.put("graduationYear", p.getGraduationYear()!=null); fields.put("targetRole", present(p.getTargetRole()));
        fields.put("experienceLevel", p.getExperienceLevel()!=null); fields.put("githubUrl", present(p.getGithubUrl())); fields.put("linkedinUrl", present(p.getLinkedinUrl()));
        fields.put("skills", userSkills.countByUserId(u.getId()) > 0);
        List<String> missing = fields.entrySet().stream().filter(e -> !e.getValue()).map(Map.Entry::getKey).toList();
        return new Completion((int) fields.values().stream().filter(Boolean::booleanValue).count() * 10, missing);
    }
    private ProfileResponse response(Profile p, User u) { Completion c=completion(p,u); return new ProfileResponse(p.getId(),u.getFullName(),u.getEmail(),p.getPhone(),p.getCollege(),p.getDegree(),p.getGraduationYear(),p.getTargetRole(),p.getExperienceLevel(),p.getGithubUrl(),p.getLinkedinUrl(),p.getBio(),c.percentage(),c.missing()); }
    private UserSkillResponse skillResponse(UserSkill s) { return new UserSkillResponse(s.getId(),s.getSkill().getId(),s.getSkill().getDisplayName(),s.getProficiencyLevel(),s.getSource(),s.getConfidence()); }
    private String normalizeSkill(String value) { return clean(value).toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9+#. ]", "").replaceAll("\\s+", " "); }
    private String value(String requested, String current, boolean replace) { return requested != null ? nullableClean(requested) : replace ? null : current; }
    private String nullableClean(String value) { String cleaned=clean(value); return cleaned.isEmpty()?null:cleaned; }
    private String clean(String value) { return value == null ? "" : value.trim().replaceAll("\\s+", " "); }
    private boolean present(String value) { return value != null && !value.isBlank(); }
    private record Completion(int percentage, List<String> missing) { }
}
