package com.careerpilot.modules.assessment.dto;
import jakarta.validation.Valid;import jakarta.validation.constraints.*;import java.util.List;
public record SubmitAttemptRequest(@NotNull @Size(max=100)List<@Valid AnswerSubmission> answers){}
