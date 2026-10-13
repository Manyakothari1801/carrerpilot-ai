package com.careerpilot.config;
import org.springframework.boot.context.properties.ConfigurationProperties;
import java.time.Duration;
import java.util.List;
@ConfigurationProperties("careerpilot.ai")
public record AiProperties(boolean enabled,String geminiApiKey,String geminiModel,List<String> fallbackModels,Duration connectTimeout,Duration requestTimeout) {
 public AiProperties{fallbackModels=fallbackModels==null?List.of():List.copyOf(fallbackModels);}
}
