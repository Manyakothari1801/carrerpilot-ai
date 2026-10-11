package com.careerpilot.modules.dsa.dto;
import com.careerpilot.modules.dsa.entity.DsaProgressStatus;
import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.List;
public final class DsaDtos { private DsaDtos(){}
 public record UpdateProgressRequest(@NotNull DsaProgressStatus status,@Min(1)@Max(5)Integer selfConfidence){}
 public record TopicProgress(String topicId,String topicName,DsaProgressStatus status,int attemptCount,Integer selfConfidence,Instant lastPracticedAt,Instant solvedAt,Integer readinessScore,String readinessLabel,boolean enoughEvidence){}
 public record Summary(int overallProgress,int solved,int attempted,int revisionDue,int tracked,String recommendedTopicId,String recommendedTopicName,String formulaVersion){}
 public record Dashboard(Summary summary,List<TopicProgress>topics,String disclaimer,String externalResourceUrl,String externalResourceNotice){}
}
