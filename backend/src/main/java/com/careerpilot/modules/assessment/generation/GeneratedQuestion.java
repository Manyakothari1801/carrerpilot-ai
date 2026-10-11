package com.careerpilot.modules.assessment.generation;
import com.careerpilot.modules.assessment.entity.AssessmentDifficulty;import java.util.List;
public record GeneratedQuestion(String questionText,AssessmentDifficulty difficulty,String skillTag,String explanation,List<GeneratedOption>options){public record GeneratedOption(String key,String text,boolean correct){}}
