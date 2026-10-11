package com.careerpilot.modules.dsa.repository;
import com.careerpilot.modules.dsa.entity.DsaTopicProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface DsaTopicProgressRepository extends JpaRepository<DsaTopicProgress,UUID>{List<DsaTopicProgress>findByUserIdOrderByUpdatedAtDesc(UUID userId);Optional<DsaTopicProgress>findByUserIdAndTopicId(UUID userId,String topicId);}
