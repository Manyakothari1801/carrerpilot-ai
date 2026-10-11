package com.careerpilot.modules.assessment.repository;
import com.careerpilot.modules.assessment.entity.Assessment;import org.springframework.data.jpa.repository.*;import org.springframework.data.repository.query.Param;import java.util.*;
public interface AssessmentRepository extends JpaRepository<Assessment,UUID>{@EntityGraph(attributePaths="questions")Optional<Assessment>findWithQuestionsByIdAndActiveTrue(UUID id);List<Assessment>findByActiveTrueOrderByTitle();}
