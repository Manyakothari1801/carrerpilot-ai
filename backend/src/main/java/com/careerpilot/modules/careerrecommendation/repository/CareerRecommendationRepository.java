package com.careerpilot.modules.careerrecommendation.repository;

import com.careerpilot.modules.careerrecommendation.entity.CareerRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CareerRecommendationRepository extends JpaRepository<CareerRecommendation,UUID>{
    List<CareerRecommendation> findByUserIdOrderByCreatedAtDesc(UUID userId);
    Optional<CareerRecommendation> findByIdAndUserId(UUID id,UUID userId);
}

