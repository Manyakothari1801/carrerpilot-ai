package com.careerpilot.modules.assessment.generation;
import com.careerpilot.modules.assessment.entity.AssessmentDifficulty;import java.util.List;
public record AssessmentGenerationRequest(String targetRole,AssessmentDifficulty difficulty,int questionCount,List<String>skills){}
