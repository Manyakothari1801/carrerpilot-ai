package com.careerpilot.modules.careerplan.repository;
import com.careerpilot.modules.careerplan.entity.CareerPlan;import org.springframework.data.jpa.repository.*;import java.util.*;
public interface CareerPlanRepository extends JpaRepository<CareerPlan,UUID>{@EntityGraph(attributePaths={"items","recommendation"})Optional<CareerPlan>findByUserId(UUID userId);}
