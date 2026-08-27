package com.careerpilot.modules.resume.analysis.mapper;
import com.careerpilot.modules.resume.analysis.dto.*;
import com.careerpilot.modules.resume.analysis.entity.*;
import org.springframework.stereotype.Component;
@Component
public class AnalysisMapper {
 public static final String DISCLAIMER="CareerPilot ATS scores are explainable application heuristics, not official or scientifically validated scores from an ATS vendor.";
 public AnalysisSummaryResponse summary(ResumeAnalysis a){return new AnalysisSummaryResponse(a.getId(),a.getResume().getId(),a.getStatus(),a.getOverallScore(),a.getAtsScore(),a.getModelProvider(),a.getCreatedAt());}
 public AnalysisResponse detail(ResumeAnalysis a){var findings=a.getFindings().stream().map(f->new AnalysisFindingResponse(f.getId(),f.getFindingType(),f.getCategory(),f.getSeverity(),f.getTitle(),f.getDescription(),f.getOriginalText(),f.getSuggestedText(),f.getSequenceOrder(),f.getCategory().startsWith("AI_"))).toList();return new AnalysisResponse(a.getId(),a.getResume().getId(),a.getStatus(),a.getOverallScore(),a.getAtsScore(),a.getSectionScore(),a.getKeywordScore(),a.getActionVerbScore(),a.getQuantificationScore(),a.getReadabilityScore(),a.getModelProvider(),a.getModelName(),a.getPrimaryModelAttempted(),a.getFallbackModelUsed(),a.getAiRequestOutcome(),a.getPromptVersion(),a.getScoringVersion(),a.getAiMessage(),a.isInputTruncated(),a.getCreatedAt(),findings,DISCLAIMER);}
}
