package com.careerpilot.config;
import org.springframework.boot.context.properties.ConfigurationProperties;
@ConfigurationProperties("careerpilot.embedding")
public record EmbeddingProperties(boolean enabled,String provider,String model){}
