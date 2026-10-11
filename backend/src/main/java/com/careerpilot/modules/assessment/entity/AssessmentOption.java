package com.careerpilot.modules.assessment.entity;
import jakarta.persistence.*;import lombok.*;import java.time.Instant;import java.util.UUID;
@Entity @Table(name="assessment_options") @Getter @Setter @NoArgsConstructor
public class AssessmentOption{@Id private UUID id;@ManyToOne(fetch=FetchType.LAZY,optional=false)@JoinColumn(name="question_id")private AssessmentQuestion question;@Column(name="option_key",nullable=false,length=10)private String optionKey;@Column(name="option_text",nullable=false,length=500)private String optionText;@Column(name="is_correct",nullable=false)private boolean correct;@Column(name="created_at",nullable=false)private Instant createdAt;@PrePersist void create(){if(id==null)id=UUID.randomUUID();if(createdAt==null)createdAt=Instant.now();}}
