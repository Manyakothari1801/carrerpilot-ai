package com.careerpilot.modules.resume.analysis.service;

import com.careerpilot.config.AnalysisProperties;
import com.careerpilot.exception.NotFoundException;
import com.careerpilot.modules.auth.entity.User;
import com.careerpilot.modules.resume.analysis.ai.*;
import com.careerpilot.modules.resume.analysis.dto.*;
import com.careerpilot.modules.resume.analysis.entity.*;
import com.careerpilot.modules.resume.analysis.mapper.AnalysisMapper;
import com.careerpilot.modules.resume.analysis.repository.ResumeAnalysisRepository;
import com.careerpilot.modules.resume.analysis.scoring.*;
import com.careerpilot.modules.resume.entity.*;
import com.careerpilot.modules.resume.exception.ResumeException;
import com.careerpilot.modules.resume.repository.ResumeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ResumeAnalysisService {
 private final ResumeRepository resumes;private final ResumeAnalysisRepository analyses;private final DeterministicResumeScoringService scoring;private final ResumeAiFeedbackService ai;private final AnalysisMapper mapper;private final AnalysisProperties properties;
 public ResumeAnalysisService(ResumeRepository resumes,ResumeAnalysisRepository analyses,DeterministicResumeScoringService scoring,ResumeAiFeedbackService ai,AnalysisMapper mapper,AnalysisProperties properties){this.resumes=resumes;this.analyses=analyses;this.scoring=scoring;this.ai=ai;this.mapper=mapper;this.properties=properties;}
 @Transactional public AnalysisResponse create(User user,UUID resumeId){Resume resume=owned(user,resumeId);if(resume.getParseStatus()!=ParseStatus.PARSED)throw new ResumeException(HttpStatus.CONFLICT,"Resume must be successfully parsed before analysis");ScoreResult score=scoring.score(resume);String input=minimized(resume);boolean truncated=input.length()>properties.maxAiInputCharacters();if(truncated)input=input.substring(0,properties.maxAiInputCharacters());AiFeedbackResult aiResult=ai.analyze(input);
  ResumeAnalysis analysis=new ResumeAnalysis();analysis.setResume(resume);analysis.setOverallScore(score.overall());analysis.setAtsScore(score.ats());analysis.setSectionScore(score.sections());analysis.setKeywordScore(score.keywords());analysis.setActionVerbScore(score.actionVerbs());analysis.setQuantificationScore(score.quantification());analysis.setReadabilityScore(score.readability());analysis.setPromptVersion(properties.promptVersion());analysis.setScoringVersion(properties.scoringVersion());analysis.setInputTruncated(truncated);analysis.setModelProvider(aiResult.provider());analysis.setModelName(aiResult.model());analysis.setPrimaryModelAttempted(aiResult.primaryModelAttempted());analysis.setFallbackModelUsed(aiResult.fallbackModelUsed());analysis.setAiRequestOutcome(aiResult.requestOutcome());analysis.setAiMessage(aiResult.message());analysis.setStatus(aiResult.status()==AiFeedbackResult.Status.FAILED?AnalysisStatus.PARTIAL:AnalysisStatus.COMPLETED);
  int order=0;for(FindingDraft draft:score.findings())add(analysis,draft.type(),draft.category(),draft.severity(),draft.title(),draft.description(),draft.originalText(),draft.suggestedText(),order++);if(aiResult.status()==AiFeedbackResult.Status.SUCCESS)order=addAi(analysis,aiResult.feedback(),order);return mapper.detail(analyses.save(analysis));}
 @Transactional(readOnly=true) public List<AnalysisSummaryResponse> history(User user,UUID resumeId){owned(user,resumeId);return analyses.findByResumeIdOrderByCreatedAtDesc(resumeId).stream().map(mapper::summary).toList();}
 @Transactional(readOnly=true) public AnalysisResponse get(User user,UUID resumeId,UUID analysisId){owned(user,resumeId);return mapper.detail(analyses.findByIdAndResumeId(analysisId,resumeId).orElseThrow(()->new NotFoundException("Resume analysis not found")));}
 @Transactional(readOnly=true) public AnalysisSummaryResponse latestActive(User user){return analyses.findFirstByResumeUserIdAndResumeActiveTrueOrderByCreatedAtDesc(user.getId()).map(mapper::summary).orElse(null);}
 private Resume owned(User user,UUID id){return resumes.findByIdAndUserId(id,user.getId()).orElseThrow(()->new NotFoundException("Resume not found"));}
 private String minimized(Resume resume){return resume.getSections().stream().filter(s->s.getSectionType()!=SectionType.CONTACT).map(s->"["+s.getSectionType()+"]\n"+s.getRawText()).collect(Collectors.joining("\n\n"));}
 private int addAi(ResumeAnalysis a,AiFeedback feedback,int order){for(var v:feedback.strengths())add(a,FindingType.STRENGTH,"AI_STRENGTH",FindingSeverity.INFO,v.title(),v.description(),null,null,order++);for(var v:feedback.weaknesses())add(a,FindingType.WEAKNESS,"AI_WEAKNESS",FindingSeverity.valueOf(v.severity().name()),v.title(),v.description(),null,null,order++);for(var v:feedback.grammarSuggestions())add(a,FindingType.GRAMMAR,"AI_WRITING",FindingSeverity.LOW,"Writing suggestion",v.reason(),v.originalText(),v.suggestedText(),order++);for(var v:feedback.bulletRewrites())add(a,FindingType.REWRITE,"AI_REWRITE",FindingSeverity.MEDIUM,"Bullet improvement",v.reason(),v.originalText(),v.suggestedText(),order++);for(String v:feedback.summarySuggestions())add(a,FindingType.WEAKNESS,"AI_SUMMARY",FindingSeverity.LOW,"Summary recommendation",v,null,null,order++);return order;}
 private void add(ResumeAnalysis a,FindingType type,String category,FindingSeverity severity,String title,String description,String original,String suggested,int order){AnalysisFinding f=new AnalysisFinding();f.setAnalysis(a);f.setFindingType(type);f.setCategory(category);f.setSeverity(severity);f.setTitle(title);f.setDescription(description);f.setOriginalText(original);f.setSuggestedText(suggested);f.setSequenceOrder(order);a.getFindings().add(f);}
}
