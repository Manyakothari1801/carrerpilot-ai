package com.careerpilot.modules.careerplan.dto;
import com.careerpilot.modules.careerplan.entity.*;import jakarta.validation.constraints.*;import java.time.Instant;import java.util.*;
public final class CareerPlanDtos{private CareerPlanDtos(){}
 public record CreatePlanRequest(@NotNull UUID recommendationId,@NotBlank @Size(max=160)String career){}
 public record UpdateStatusRequest(@NotNull RoadmapStatus status){}
 public record SkillGapItem(String skill,String category,String state,String proficiency,String nextAction){}
 public record SkillGapResponse(int score,List<SkillGapItem>present,List<SkillGapItem>missingCore,List<SkillGapItem>missingSupporting,List<SkillGapItem>needsImprovement){}
 public record ReadinessComponent(String key,String label,Integer score,int configuredWeight,Integer effectiveWeight,String status,String evidence){}
 public record ReadinessResponse(int score,String version,List<ReadinessComponent>components,List<String>howToImprove,String disclaimer){}
 public record RoadmapItemResponse(UUID id,int stageOrder,String stageName,int itemOrder,String topic,String skillName,String whyItMatters,String nextAction,RoadmapStatus status,RoadmapStatusSource statusSource,Instant updatedAt){}
 public record PlanResponse(UUID id,UUID recommendationId,String selectedCareer,String taxonomyVersion,Instant createdAt,Instant updatedAt,SkillGapResponse skillGap,ReadinessResponse placementReadiness,List<RoadmapItemResponse>roadmap,List<String>nextActions,int progressPercentage){}
}
