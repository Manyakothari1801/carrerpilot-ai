package com.careerpilot.modules.assessment.dto;
import jakarta.validation.constraints.NotNull;import jakarta.validation.constraints.Size;import java.util.UUID;
public record AnswerSubmission(@NotNull UUID questionId,@Size(max=10)String selectedOptionKey,@Size(max=2000)String textAnswer){}
