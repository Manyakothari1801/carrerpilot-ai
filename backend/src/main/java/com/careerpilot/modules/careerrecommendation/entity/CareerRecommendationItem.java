package com.careerpilot.modules.careerrecommendation.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Entity @Table(name="career_recommendation_items") @Getter @Setter @NoArgsConstructor
public class CareerRecommendationItem {
    @Id private UUID id;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="recommendation_id") private CareerRecommendation recommendation;
    @Column(name="recommendation_rank",nullable=false) private int recommendationRank;
    @Column(nullable=false,length=160) private String career;
    @Column(nullable=false,precision=8,scale=7) private BigDecimal confidence;
    @Column(name="profile_signals",nullable=false,columnDefinition="text") private String profileSignals;
    @PrePersist void create(){if(id==null)id=UUID.randomUUID();}
}

