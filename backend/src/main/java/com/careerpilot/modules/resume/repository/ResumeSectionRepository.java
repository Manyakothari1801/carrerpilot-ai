package com.careerpilot.modules.resume.repository;
import com.careerpilot.modules.resume.entity.ResumeSection;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
public interface ResumeSectionRepository extends JpaRepository<ResumeSection, UUID> { }
