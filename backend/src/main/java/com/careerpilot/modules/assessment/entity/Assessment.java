package com.careerpilot.modules.assessment.entity;

import com.careerpilot.modules.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.*;

@Entity @Table(name="assessments") @Getter @Setter @NoArgsConstructor
public class Assessment {
 @Id private UUID id; @Column(nullable=false,length=180) private String title; @Column(nullable=false,length=1000) private String description;
 @Enumerated(EnumType.STRING) @Column(name="assessment_type",nullable=false,length=30) private AssessmentType assessmentType;
 @Column(name="target_role",length=160) private String targetRole; @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) private AssessmentDifficulty difficulty;
 @Column(name="duration_minutes",nullable=false) private int durationMinutes; @Column(name="total_questions",nullable=false) private int totalQuestions;
 @Column(name="passing_percentage",nullable=false) private int passingPercentage; @Column(name="generation_source",nullable=false,length=30) private String generationSource;
 @Column(name="generation_model",length=120) private String generationModel; @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="created_by") private User createdBy;
 @Column(name="catalog_group",nullable=false,length=30) private String catalogGroup="PRACTICE";
 @Column(nullable=false) private boolean active; @Column(name="created_at",nullable=false) private Instant createdAt; @Column(name="updated_at",nullable=false) private Instant updatedAt;
 @OneToMany(mappedBy="assessment",cascade=CascadeType.ALL,orphanRemoval=true) @OrderBy("questionOrder") private List<AssessmentQuestion> questions=new ArrayList<>();
 @PrePersist void create(){if(id==null)id=UUID.randomUUID();if(createdAt==null)createdAt=Instant.now();updatedAt=createdAt;} @PreUpdate void update(){updatedAt=Instant.now();}
}
