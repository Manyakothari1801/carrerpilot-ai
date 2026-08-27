package com.careerpilot.modules.resume.analysis.repository;
import com.careerpilot.modules.resume.analysis.entity.ResumeAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface ResumeAnalysisRepository extends JpaRepository<ResumeAnalysis,UUID>{
 List<ResumeAnalysis> findByResumeIdOrderByCreatedAtDesc(UUID resumeId);
 Optional<ResumeAnalysis> findByIdAndResumeId(UUID id,UUID resumeId);
 Optional<ResumeAnalysis> findFirstByResumeUserIdAndResumeActiveTrueOrderByCreatedAtDesc(UUID userId);
}
