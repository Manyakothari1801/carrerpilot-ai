package com.careerpilot.modules.resume.analysis.dto;
import com.careerpilot.modules.resume.analysis.entity.AnalysisStatus;
import java.time.Instant;
import java.util.UUID;
public record AnalysisSummaryResponse(UUID id,UUID resumeId,AnalysisStatus status,int overallScore,int atsScore,String modelProvider,Instant createdAt) { }
