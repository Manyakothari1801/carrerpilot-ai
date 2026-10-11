package com.careerpilot.modules.assessment.dto;
import com.careerpilot.modules.assessment.entity.AttemptStatus;import java.time.Instant;import java.util.UUID;
public record AttemptSummaryResponse(UUID id,UUID assessmentId,String assessmentTitle,AttemptStatus status,Instant startedAt,Instant submittedAt,Integer scorePercentage,Boolean passed,Integer durationSeconds){}
