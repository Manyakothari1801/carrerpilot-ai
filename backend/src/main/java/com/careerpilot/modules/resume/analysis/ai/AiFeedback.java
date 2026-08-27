package com.careerpilot.modules.resume.analysis.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = false)
public record AiFeedback(List<Insight> strengths, List<Weakness> weaknesses,
                         List<TextSuggestion> grammarSuggestions, List<TextSuggestion> bulletRewrites,
                         List<String> summarySuggestions) {
 @JsonIgnoreProperties(ignoreUnknown = false)
 public record Insight(String title, String description) { }
 @JsonIgnoreProperties(ignoreUnknown = false)
 public record Weakness(String title, String description, Severity severity) { }
 @JsonIgnoreProperties(ignoreUnknown = false)
 public record TextSuggestion(String originalText, String suggestedText, String reason) { }
 public enum Severity { LOW, MEDIUM, HIGH }
}
