package com.careerpilot.modules.assessment.dto;
import java.util.List;
public record AssessmentDetailResponse(AssessmentSummaryResponse assessment,List<QuestionResponse> questions,String instructions){}
