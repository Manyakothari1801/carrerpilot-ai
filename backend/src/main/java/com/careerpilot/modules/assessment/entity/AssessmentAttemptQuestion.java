package com.careerpilot.modules.assessment.entity;
import jakarta.persistence.*;import lombok.*;import java.time.Instant;import java.util.UUID;
@Entity @Table(name="assessment_attempt_questions") @Getter @Setter @NoArgsConstructor
public class AssessmentAttemptQuestion{@Id private UUID id;@ManyToOne(fetch=FetchType.LAZY,optional=false)@JoinColumn(name="attempt_id")private AssessmentAttempt attempt;@ManyToOne(fetch=FetchType.LAZY,optional=false)@JoinColumn(name="question_id")private AssessmentQuestion question;@Column(name="question_order",nullable=false)private int questionOrder;@Column(name="created_at",nullable=false)private Instant createdAt;@PrePersist void create(){if(id==null)id=UUID.randomUUID();if(createdAt==null)createdAt=Instant.now();}}
