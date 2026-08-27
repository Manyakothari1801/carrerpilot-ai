package com.careerpilot.modules.resume.analysis.dto;
import com.careerpilot.modules.resume.analysis.entity.*;
import java.util.UUID;
public record AnalysisFindingResponse(UUID id,FindingType type,String category,FindingSeverity severity,String title,String description,String originalText,String suggestedText,int sequenceOrder,boolean aiGenerated) { }
