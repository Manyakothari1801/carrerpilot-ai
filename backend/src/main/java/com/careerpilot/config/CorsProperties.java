package com.careerpilot.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "careerpilot.cors")
public record CorsProperties(List<String> allowedOrigins) {
}

