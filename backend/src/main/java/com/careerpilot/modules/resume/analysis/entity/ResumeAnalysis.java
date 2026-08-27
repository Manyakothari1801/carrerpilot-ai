package com.careerpilot.modules.resume.analysis.entity;
import com.careerpilot.modules.resume.entity.Resume;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.*;
@Entity @Table(name="resume_analyses") @Getter @Setter @NoArgsConstructor
public class ResumeAnalysis {
 @Id private UUID id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="resume_id") private Resume resume;
 @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) private AnalysisStatus status;
 @Column(name="overall_score",nullable=false) private int overallScore;
 @Column(name="ats_score",nullable=false) private int atsScore;
 @Column(name="section_score",nullable=false) private int sectionScore;
 @Column(name="keyword_score",nullable=false) private int keywordScore;
 @Column(name="action_verb_score",nullable=false) private int actionVerbScore;
 @Column(name="quantification_score",nullable=false) private int quantificationScore;
 @Column(name="readability_score",nullable=false) private int readabilityScore;
 @Column(name="model_provider",length=40) private String modelProvider;
 @Column(name="model_name",length=100) private String modelName;
 @Column(name="primary_model_attempted",length=100) private String primaryModelAttempted;
 @Column(name="fallback_model_used",length=100) private String fallbackModelUsed;
 @Column(name="ai_request_outcome",length=40) private String aiRequestOutcome;
 @Column(name="prompt_version",nullable=false,length=60) private String promptVersion;
 @Column(name="scoring_version",nullable=false,length=60) private String scoringVersion;
 @Column(name="ai_message",length=500) private String aiMessage;
 @Column(name="input_truncated",nullable=false) private boolean inputTruncated;
 @Column(name="created_at",nullable=false) private Instant createdAt;
 @OneToMany(mappedBy="analysis",cascade=CascadeType.ALL,orphanRemoval=true) @OrderBy("sequenceOrder ASC") private List<AnalysisFinding> findings=new ArrayList<>();
 @PrePersist void create(){if(id==null)id=UUID.randomUUID();if(createdAt==null)createdAt=Instant.now();}
}
