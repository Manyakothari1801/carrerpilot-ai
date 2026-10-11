package com.careerpilot.modules.careerintelligence.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public final class CareerIntelligenceDtos {
    private CareerIntelligenceDtos() {}

    public record SkillInput(@NotBlank @Size(max=120) String name,@NotBlank @Size(max=30) String proficiency) {}
    public record SimulationRequest(@NotEmpty @Size(max=20) List<@Valid SkillInput> hypotheticalSkills) {}
    public record CounterfactualRequest(@NotBlank @Size(max=120) String targetCareer,@Min(1) @Max(3) int maxChanges) {}
    public record FeatureContribution(String feature,double contribution) {}
    public record ExplainedItem(String career,double confidence,List<String> profileSignals,List<FeatureContribution> supportingSignals,List<FeatureContribution> limitingSignals) {}
    public record ExplainResponse(String modelVersion,String featureSchemaVersion,String disclaimer,List<ExplainedItem> recommendations) {}
    public record PredictionItem(String career,double confidence,List<String> profileSignals) {}
    public record SimulationResponse(String modelVersion,String featureSchemaVersion,List<PredictionItem> before,List<PredictionItem> simulated,List<SkillInput> appliedSkills,String disclaimer) {}
    public record CounterfactualResponse(String modelVersion,String featureSchemaVersion,String targetCareer,boolean found,int currentRank,Integer simulatedRank,double currentConfidence,Double simulatedConfidence,Double confidenceDelta,Integer rankDelta,List<SkillInput> proposedSkills,String disclaimer) {}
    public record OptionsResponse(List<String> careers,List<String> actionableSkills) {}
}
