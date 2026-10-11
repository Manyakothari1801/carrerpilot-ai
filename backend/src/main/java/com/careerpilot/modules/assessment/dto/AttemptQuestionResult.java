package com.careerpilot.modules.assessment.dto;
import com.careerpilot.modules.assessment.entity.AssessmentDifficulty;import java.util.*;
public record AttemptQuestionResult(UUID questionId,int order,String question,String selectedOptionKey,String selectedOptionText,String correctOptionKey,String correctOptionText,String explanation,String skillTag,AssessmentDifficulty difficulty,Boolean correct){}
