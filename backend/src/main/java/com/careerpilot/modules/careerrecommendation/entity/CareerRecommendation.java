package com.careerpilot.modules.careerrecommendation.entity;

import com.careerpilot.modules.auth.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity @Table(name="career_recommendations") @Getter @Setter @NoArgsConstructor
public class CareerRecommendation {
    @Id private UUID id;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="user_id") private User user;
    @Column(name="model_version",nullable=false,length=100) private String modelVersion;
    @Column(name="feature_schema_version",nullable=false,length=100) private String featureSchemaVersion;
    @Column(length=120) private String degree;
    @Column(name="experience_level",length=30) private String experienceLevel;
    @Column(name="target_role",length=120) private String targetRole;
    @Column(name="created_at",nullable=false) private Instant createdAt;
    @OneToMany(mappedBy="recommendation",cascade=CascadeType.ALL,orphanRemoval=true)
    @OrderBy("recommendationRank") private List<CareerRecommendationItem> items=new ArrayList<>();
    @PrePersist void create(){if(id==null)id=UUID.randomUUID();if(createdAt==null)createdAt=Instant.now();}
}

