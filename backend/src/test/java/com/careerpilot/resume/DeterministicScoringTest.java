package com.careerpilot.resume;
import com.careerpilot.config.AnalysisProperties;
import com.careerpilot.modules.resume.analysis.scoring.DeterministicResumeScoringService;
import com.careerpilot.modules.resume.entity.*;
import com.careerpilot.modules.resume.parser.ContactExtractor;
import org.junit.jupiter.api.Test;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;
class DeterministicScoringTest {
 private final DeterministicResumeScoringService scoring=new DeterministicResumeScoringService(new AnalysisProperties("ats-rules-v1","resume-analysis-v1",30000,List.of("built","developed","implemented","optimized"),new AnalysisProperties.Weights(30,20,20,15,15,40,20,10,10,10,10)),new ContactExtractor());
 @Test void scoresSectionsActionVerbsAndQuantifiedImpactExplainably(){Resume complete=resume(section(SectionType.CONTACT,"student@example.com +1 555 123 4567"),section(SectionType.SUMMARY,"Backend engineer"),section(SectionType.EDUCATION,"B.Tech"),section(SectionType.SKILLS,"Java Spring PostgreSQL Docker"),section(SectionType.EXPERIENCE,"Built APIs serving 10,000 users\nOptimized latency by 30%"),section(SectionType.PROJECTS,"Developed CareerPilot using React"));var result=scoring.score(complete);assertThat(result.sections()).isEqualTo(100);assertThat(result.actionVerbs()).isEqualTo(100);assertThat(result.quantification()).isGreaterThanOrEqualTo(60);assertThat(result.ats()).isBetween(0,100);}
 @Test void missingSectionsAndWeakBulletsReduceScores(){Resume sparse=resume(section(SectionType.OTHER,"Worked on things"));var result=scoring.score(sparse);assertThat(result.sections()).isLessThan(30);assertThat(result.actionVerbs()).isLessThan(50);assertThat(result.findings()).isNotEmpty();}
 private Resume resume(ResumeSection...sections){Resume r=new Resume();r.getSections().addAll(List.of(sections));return r;}
 private ResumeSection section(SectionType type,String text){ResumeSection s=new ResumeSection();s.setSectionType(type);s.setRawText(text);return s;}
}
