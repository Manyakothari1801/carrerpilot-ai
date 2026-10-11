package com.careerpilot.modules.careerplan.entity;
import jakarta.persistence.*;import lombok.*;import java.time.Instant;import java.util.UUID;
@Entity @Table(name="career_roadmap_items")@Getter@Setter@NoArgsConstructor public class CareerRoadmapItem{
 @Id private UUID id;@ManyToOne(fetch=FetchType.LAZY,optional=false)@JoinColumn(name="career_plan_id")private CareerPlan careerPlan;@Column(name="stage_order",nullable=false)private int stageOrder;@Column(name="stage_name",nullable=false,length=100)private String stageName;@Column(name="item_order",nullable=false)private int itemOrder;@Column(nullable=false,length=160)private String topic;@Column(name="skill_name",length=120)private String skillName;@Column(name="why_it_matters",nullable=false,length=700)private String whyItMatters;@Column(name="next_action",nullable=false,length=700)private String nextAction;@Enumerated(EnumType.STRING)@Column(nullable=false,length=30)private RoadmapStatus status;@Enumerated(EnumType.STRING)@Column(name="status_source",nullable=false,length=30)private RoadmapStatusSource statusSource;@Column(name="updated_at",nullable=false)private Instant updatedAt;
 @PrePersist void create(){if(id==null)id=UUID.randomUUID();updatedAt=Instant.now();}@PreUpdate void update(){updatedAt=Instant.now();}
}

