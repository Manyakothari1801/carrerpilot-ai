package com.careerpilot.modules.careerplan.repository;
import com.careerpilot.modules.careerplan.entity.CareerRoadmapItem;import org.springframework.data.jpa.repository.JpaRepository;import java.util.*;
public interface CareerRoadmapItemRepository extends JpaRepository<CareerRoadmapItem,UUID>{Optional<CareerRoadmapItem>findByIdAndCareerPlanUserId(UUID id,UUID userId);}

