package com.careerpilot.modules.assessment.generation;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;import org.springframework.stereotype.Component;import java.util.List;
@Component @ConditionalOnProperty(name="careerpilot.assessment.ai-generation-enabled",havingValue="false",matchIfMissing=true) public class UnavailableAssessmentAiQuestionProvider implements AssessmentAiQuestionProvider{public List<GeneratedQuestion>generate(AssessmentGenerationRequest request){return List.of();}public String model(){return"UNAVAILABLE";}}
