package com.careerpilot.modules.resume.analysis.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;
@Entity @Table(name="analysis_findings") @Getter @Setter @NoArgsConstructor
public class AnalysisFinding {
 @Id private UUID id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="analysis_id") private ResumeAnalysis analysis;
 @Enumerated(EnumType.STRING) @Column(name="finding_type",nullable=false,length=30) private FindingType findingType;
 @Column(nullable=false,length=50) private String category;
 @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) private FindingSeverity severity;
 @Column(nullable=false,length=200) private String title;
 @Column(nullable=false,length=2000) private String description;
 @Column(name="original_text",columnDefinition="text") private String originalText;
 @Column(name="suggested_text",columnDefinition="text") private String suggestedText;
 @Column(name="sequence_order",nullable=false) private int sequenceOrder;
 @Column(name="created_at",nullable=false) private Instant createdAt;
 @PrePersist void create(){if(id==null)id=UUID.randomUUID();if(createdAt==null)createdAt=Instant.now();}
}
