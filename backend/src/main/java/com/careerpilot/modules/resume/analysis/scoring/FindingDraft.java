package com.careerpilot.modules.resume.analysis.scoring;
import com.careerpilot.modules.resume.analysis.entity.*;
public record FindingDraft(FindingType type,String category,FindingSeverity severity,String title,String description,String originalText,String suggestedText) {
 public static FindingDraft of(FindingType type,String category,FindingSeverity severity,String title,String description){return new FindingDraft(type,category,severity,title,description,null,null);}
}
