package com.careerpilot.modules.assessment.dto;
import com.careerpilot.modules.assessment.entity.*;import java.util.*;
public record QuestionResponse(UUID id,int order,QuestionType type,String text,AssessmentDifficulty difficulty,String skillTag,List<OptionResponse> options){}
