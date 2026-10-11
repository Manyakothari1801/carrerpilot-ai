package com.careerpilot.modules.interview.dto;
import com.careerpilot.modules.interview.entity.*;import jakarta.validation.constraints.*;import java.time.Instant;import java.util.*;
public final class InterviewDtos{private InterviewDtos(){}
 public record StartRequest(@NotBlank@Size(max=120)String targetCareer,@NotBlank@Pattern(regexp="TECHNICAL|BEHAVIORAL|MIXED")String interviewType,@NotNull InterviewMode mode,@Size(max=120)String focusArea,@Min(3)@Max(10)int questionCount){}
 public record SubmitAnswerRequest(@NotBlank@Size(max=12000)String transcript,@Min(0)@Max(7200)Integer answerDurationSeconds){}
 public record Scores(int technicalCorrectness,int relevance,int answerStructure,int completeness,int communicationClarity){}
 public record Answer(UUID id,int sequenceNumber,String question,String transcript,List<String>strengths,List<String>needsImprovement,String nextFocus,String suggestedAnswer,List<String>topicsToReview,Scores scores,Integer answerDurationSeconds,Instant createdAt){}
 public record Session(UUID id,String targetCareer,String interviewType,InterviewMode mode,String focusArea,int questionCount,InterviewStatus status,String currentQuestion,int completedAnswers,Integer overallCoachingScore,String provider,String model,Instant startedAt,Instant completedAt,List<Answer>answers,String disclaimer){}
 public record History(UUID id,String targetCareer,String interviewType,InterviewMode mode,int questionCount,int completedAnswers,InterviewStatus status,Integer overallCoachingScore,Instant startedAt,Instant completedAt){}
 public record TranscriptionStatus(boolean available,String provider,String message){}
}
