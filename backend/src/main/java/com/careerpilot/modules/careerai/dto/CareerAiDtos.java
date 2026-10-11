package com.careerpilot.modules.careerai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.Map;

public final class CareerAiDtos {
    private CareerAiDtos() {}
    public record InterviewRequest(@NotBlank @Size(max=120) String targetCareer,@NotBlank @Pattern(regexp="TECHNICAL|RESUME_BASED|SKILL_GAP_FOCUSED") String mode,@Size(max=120) String focusArea,@Size(max=4000) String previousQuestion,@Size(max=6000) String answer) {}
    public record InterviewScores(int technicalCorrectness,int relevance,int answerStructure,int completeness,int communicationClarity) {}
    public record InterviewFeedback(List<String> strengths,List<String> needsImprovement,String nextFocus,InterviewScores scores,String suggestedAnswer,List<String> topicsToReview) {}
    public record InterviewResponse(String targetCareer,String mode,String question,InterviewFeedback feedback,String provider,String model,String disclaimer) {}
    public record CopilotRequest(@NotBlank @Size(max=1000) String question) {}
    public record CopilotResponse(Map<String,String> currentEvidence,String aiGuidance,String provider,String model,String disclaimer) {}
}
