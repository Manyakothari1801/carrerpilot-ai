package com.careerpilot.modules.assessment.repository;
import com.careerpilot.modules.assessment.entity.AssessmentAttempt;import org.springframework.data.jpa.repository.*;import java.util.*;
public interface AssessmentAttemptRepository extends JpaRepository<AssessmentAttempt,UUID>{Optional<AssessmentAttempt>findByIdAndUserId(UUID id,UUID userId);List<AssessmentAttempt>findByUserIdOrderByCreatedAtDesc(UUID userId);Optional<AssessmentAttempt>findFirstByUserIdAndStatusOrderByCreatedAtDesc(UUID userId,com.careerpilot.modules.assessment.entity.AttemptStatus status);}
