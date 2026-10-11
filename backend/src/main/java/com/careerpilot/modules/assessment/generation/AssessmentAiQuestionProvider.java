package com.careerpilot.modules.assessment.generation;
import java.util.List;
public interface AssessmentAiQuestionProvider{List<GeneratedQuestion>generate(AssessmentGenerationRequest request);String model();}
