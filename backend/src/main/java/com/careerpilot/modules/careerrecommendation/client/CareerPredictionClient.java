package com.careerpilot.modules.careerrecommendation.client;

import java.util.List;

public interface CareerPredictionClient {
    PredictionResponse predict(PredictionRequest request);
    ExplainResponse explain(PredictionRequest request);
    SimulationResponse simulate(SimulationRequest request);
    CounterfactualResponse counterfactual(CounterfactualRequest request);
    record SkillInput(String name,String proficiency){}
    record PredictionRequest(String degree,Integer graduationYear,String experienceLevel,String targetRole,List<SkillInput> skills,int topN){}
    record PredictionItem(String career,double confidence,List<String> profileSignals){}
    record PredictionResponse(String modelVersion,String featureSchemaVersion,List<PredictionItem> recommendations){}
    record FeatureContribution(String feature,double contribution){}
    record ExplainedPredictionItem(String career,double confidence,List<String> profileSignals,List<FeatureContribution> supportingSignals,List<FeatureContribution> limitingSignals){}
    record ExplainResponse(String modelVersion,String featureSchemaVersion,String disclaimer,List<ExplainedPredictionItem> recommendations){}
    record SimulationRequest(String degree,Integer graduationYear,String experienceLevel,String targetRole,List<SkillInput> skills,int topN,List<SkillInput> hypotheticalSkills){}
    record SimulationResponse(String modelVersion,String featureSchemaVersion,List<PredictionItem> before,List<PredictionItem> simulated,List<SkillInput> appliedSkills,String disclaimer){}
    record CounterfactualRequest(String degree,Integer graduationYear,String experienceLevel,String targetRole,List<SkillInput> skills,int topN,String targetCareer,int maxChanges){}
    record CounterfactualResponse(String modelVersion,String featureSchemaVersion,String targetCareer,boolean found,int currentRank,Integer simulatedRank,double currentConfidence,Double simulatedConfidence,Double confidenceDelta,Integer rankDelta,List<SkillInput> proposedSkills,String disclaimer){}
}

