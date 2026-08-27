package com.careerpilot.modules.resume.analysis.dto;
import com.careerpilot.modules.resume.analysis.entity.AnalysisStatus;
import java.time.Instant;
import java.util.*;
public record AnalysisResponse(UUID id,UUID resumeId,AnalysisStatus status,int overallScore,int atsScore,int sectionScore,int keywordScore,int actionVerbScore,int quantificationScore,int readabilityScore,String modelProvider,String modelName,String primaryModelAttempted,String fallbackModelUsed,String aiRequestOutcome,String promptVersion,String scoringVersion,String aiMessage,boolean inputTruncated,Instant createdAt,List<AnalysisFindingResponse> findings,String scoreDisclaimer) { }
