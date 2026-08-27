package com.careerpilot.modules.resume.analysis.scoring;
import java.util.List;
public record ScoreResult(int overall,int ats,int sections,int keywords,int actionVerbs,int quantification,int readability,List<FindingDraft> findings) { }
