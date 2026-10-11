package com.careerpilot.modules.careerrecommendation.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class CareerRecommendationDtos {
    private CareerRecommendationDtos(){}
    public record ReadinessResponse(boolean ready,List<String> missingFields,int skillCount){}
    public record ItemResponse(int rank,String career,double confidence,List<String> profileSignals){}
    public record DetailResponse(UUID id,String modelVersion,String featureSchemaVersion,String degree,String experienceLevel,
                                 String targetRole,Instant createdAt,List<ItemResponse> recommendations){}
    public record SummaryResponse(UUID id,String topCareer,double topConfidence,String modelVersion,Instant createdAt){}
}

