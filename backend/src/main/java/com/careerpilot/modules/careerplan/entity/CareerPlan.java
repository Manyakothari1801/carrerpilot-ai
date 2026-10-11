package com.careerpilot.modules.careerplan.entity;
import com.careerpilot.modules.auth.entity.User;import com.careerpilot.modules.careerrecommendation.entity.CareerRecommendation;import jakarta.persistence.*;import lombok.*;import java.time.Instant;import java.util.*;
@Entity @Table(name="career_plans") @Getter @Setter @NoArgsConstructor public class CareerPlan{
 @Id private UUID id;@OneToOne(fetch=FetchType.LAZY,optional=false)@JoinColumn(name="user_id",unique=true)private User user;@ManyToOne(fetch=FetchType.LAZY,optional=false)@JoinColumn(name="recommendation_id")private CareerRecommendation recommendation;
 @Column(name="selected_career",nullable=false,length=160)private String selectedCareer;@Column(name="taxonomy_version",nullable=false,length=80)private String taxonomyVersion;@Column(name="readiness_version",nullable=false,length=80)private String readinessVersion;@Column(name="created_at",nullable=false)private Instant createdAt;@Column(name="updated_at",nullable=false)private Instant updatedAt;
 @OneToMany(mappedBy="careerPlan",cascade=CascadeType.ALL,orphanRemoval=true)@OrderBy("stageOrder,itemOrder")private List<CareerRoadmapItem>items=new ArrayList<>();
 @PrePersist void create(){var now=Instant.now();if(id==null)id=UUID.randomUUID();if(createdAt==null)createdAt=now;updatedAt=now;}@PreUpdate void update(){updatedAt=Instant.now();}
}
