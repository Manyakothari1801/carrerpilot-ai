package com.careerpilot.config;
import org.springframework.boot.context.properties.ConfigurationProperties;
import java.util.List;
@ConfigurationProperties("careerpilot.analysis")
public record AnalysisProperties(String scoringVersion,String promptVersion,int maxAiInputCharacters,List<String> strongActionVerbs,Weights weights) {
 public record Weights(int atsSection,int atsKeyword,int atsActionVerb,int atsQuantification,int atsReadability,int overallAts,int overallSection,int overallKeyword,int overallActionVerb,int overallQuantification,int overallReadability) { }
}
