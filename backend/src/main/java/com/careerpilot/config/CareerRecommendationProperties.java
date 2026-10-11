package com.careerpilot.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

@ConfigurationProperties("careerpilot.career-recommendation")
public record CareerRecommendationProperties(String serviceUrl, Duration connectTimeout, Duration readTimeout, int topN) {
    public CareerRecommendationProperties {
        if (serviceUrl == null || serviceUrl.isBlank()) serviceUrl = "http://localhost:8000";
        if (connectTimeout == null) connectTimeout = Duration.ofSeconds(3);
        if (readTimeout == null) readTimeout = Duration.ofSeconds(10);
        if (topN < 1 || topN > 5) topN = 3;
    }
}

