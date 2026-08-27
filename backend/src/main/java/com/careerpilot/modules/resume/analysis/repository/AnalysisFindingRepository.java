package com.careerpilot.modules.resume.analysis.repository;
import com.careerpilot.modules.resume.analysis.entity.AnalysisFinding;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
public interface AnalysisFindingRepository extends JpaRepository<AnalysisFinding,UUID>{}
