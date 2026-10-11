package com.careerpilot.modules.assessment.dto;
import com.careerpilot.modules.assessment.entity.*;import java.util.UUID;
public record AssessmentSummaryResponse(UUID id,String title,String description,AssessmentType assessmentType,String targetRole,AssessmentDifficulty difficulty,int durationMinutes,int totalQuestions,int passingPercentage,String catalogGroup){}
