package com.careerpilot.config;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.time.Duration;

@Validated
@ConfigurationProperties("careerpilot.assessment")
public record AssessmentProperties(Duration defaultDuration, @Min(1) @Max(100) int maxQuestions,
                                   boolean aiGenerationEnabled) {
}
