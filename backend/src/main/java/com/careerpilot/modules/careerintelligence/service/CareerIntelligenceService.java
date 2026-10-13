package com.careerpilot.modules.careerintelligence.service;

import com.careerpilot.exception.ApiException;
import com.careerpilot.exception.NotFoundException;
import com.careerpilot.modules.auth.entity.User;
import com.careerpilot.modules.careerintelligence.dto.CareerIntelligenceDtos.*;
import com.careerpilot.modules.careerplan.taxonomy.CareerSkillTaxonomy;
import com.careerpilot.modules.careerrecommendation.client.CareerPredictionClient;
import com.careerpilot.modules.profile.entity.Profile;
import com.careerpilot.modules.profile.entity.UserSkill;
import com.careerpilot.modules.profile.repository.ProfileRepository;
import com.careerpilot.modules.profile.repository.UserSkillRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class CareerIntelligenceService {
    private final ProfileRepository profiles;
    private final UserSkillRepository skills;
    private final CareerPredictionClient client;
    private final CareerSkillTaxonomy taxonomy;

    public CareerIntelligenceService(ProfileRepository profiles,UserSkillRepository skills,CareerPredictionClient client,CareerSkillTaxonomy taxonomy){
        this.profiles=profiles;this.skills=skills;this.client=client;this.taxonomy=taxonomy;
    }

    @Transactional(readOnly=true)
    public ExplainResponse explain(User user){
        var request=base(user);
        try {
            var value=client.explain(request);
            return new ExplainResponse(value.modelVersion(),value.featureSchemaVersion(),value.disclaimer(),value.recommendations().stream().map(item->new ExplainedItem(item.career(),item.confidence(),item.profileSignals(),item.supportingSignals().stream().map(v->new FeatureContribution(v.feature(),v.contribution())).toList(),item.limitingSignals().stream().map(v->new FeatureContribution(v.feature(),v.contribution())).toList())).toList(),true,null);
        } catch(ApiException exception) {
            if(exception.getStatus()!=HttpStatus.SERVICE_UNAVAILABLE)throw exception;
            return new ExplainResponse(null,null,"Career predictions remain valid, but model explanations are temporarily unavailable.",List.of(),false,"Explanation service temporarily unavailable");
        }
    }

    @Transactional(readOnly=true)
    public SimulationResponse simulate(User user,SimulationRequest request){
        validateSkills(request.hypotheticalSkills());
        var base=base(user);var additions=request.hypotheticalSkills().stream().map(v->new CareerPredictionClient.SkillInput(v.name().trim(),v.proficiency().trim().toUpperCase(Locale.ROOT))).toList();
        var value=client.simulate(new CareerPredictionClient.SimulationRequest(base.degree(),base.graduationYear(),base.experienceLevel(),base.targetRole(),base.skills(),base.topN(),additions));
        return new SimulationResponse(value.modelVersion(),value.featureSchemaVersion(),items(value.before()),items(value.simulated()),value.appliedSkills().stream().map(v->new SkillInput(v.name(),v.proficiency())).toList(),value.disclaimer());
    }

    @Transactional(readOnly=true)
    public CounterfactualResponse counterfactual(User user,CounterfactualRequest request){
        if(taxonomy.find(request.targetCareer()).isEmpty())throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,"Unsupported target career");
        var base=base(user);var value=client.counterfactual(new CareerPredictionClient.CounterfactualRequest(base.degree(),base.graduationYear(),base.experienceLevel(),base.targetRole(),base.skills(),8,request.targetCareer().trim(),request.maxChanges()));
        return new CounterfactualResponse(value.modelVersion(),value.featureSchemaVersion(),value.targetCareer(),value.found(),value.currentRank(),value.simulatedRank(),value.currentConfidence(),value.simulatedConfidence(),value.confidenceDelta(),value.rankDelta(),value.proposedSkills().stream().map(v->new SkillInput(v.name(),v.proficiency())).toList(),value.disclaimer());
    }

    public OptionsResponse options(){return new OptionsResponse(List.copyOf(taxonomy.supportedCareers()),List.copyOf(taxonomy.actionableSkills()));}

    private CareerPredictionClient.PredictionRequest base(User user){
        Profile profile=profiles.findByUserId(user.getId()).orElseThrow(()->new NotFoundException("Student profile not found"));
        List<UserSkill> values=skills.findByUserIdOrderBySkillDisplayName(user.getId());
        if(profile.getDegree()==null||profile.getDegree().isBlank()||profile.getExperienceLevel()==null||profile.getTargetRole()==null||profile.getTargetRole().isBlank()||values.size()<2)throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,"Complete degree, experience level, target role, and at least two profile skills before using CareerTwin AI");
        return new CareerPredictionClient.PredictionRequest(profile.getDegree(),profile.getGraduationYear(),profile.getExperienceLevel().name(),profile.getTargetRole(),values.stream().map(v->new CareerPredictionClient.SkillInput(v.getSkill().getDisplayName(),v.getProficiencyLevel().name())).toList(),8);
    }

    private void validateSkills(List<SkillInput> requested){
        Set<String> allowed=taxonomy.actionableSkills().stream().map(v->v.toLowerCase(Locale.ROOT)).collect(java.util.stream.Collectors.toSet());
        for(var skill:requested){if(!allowed.contains(skill.name().trim().toLowerCase(Locale.ROOT)))throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,"Hypothetical skills must come from the career taxonomy");}
    }
    private List<PredictionItem> items(List<CareerPredictionClient.PredictionItem> values){return values.stream().map(v->new PredictionItem(v.career(),v.confidence(),v.profileSignals())).toList();}
}
