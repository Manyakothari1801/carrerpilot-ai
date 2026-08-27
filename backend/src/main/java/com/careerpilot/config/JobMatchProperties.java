package com.careerpilot.config;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.boot.context.properties.ConfigurationProperties;
@ConfigurationProperties("careerpilot.job-match")
public record JobMatchProperties(@NotBlank String scoringVersion,@Min(100) int minDescriptionCharacters,@Max(100000) int maxDescriptionCharacters,@Valid Weights weights){
 public record Weights(@Min(0) int skill,@Min(0) int keyword,@Min(0) int semantic,@Min(0) int experience,@Min(0) int education){}
}
