package com.careerpilot.config;
import org.springframework.boot.context.properties.ConfigurationProperties;
import java.time.Duration;
@ConfigurationProperties("careerpilot.ai")
public record AiProperties(boolean enabled,String geminiApiKey,String geminiModel,Duration connectTimeout,Duration requestTimeout) { }
