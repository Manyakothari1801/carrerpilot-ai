package com.careerpilot.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("careerpilot.resume")
public record ResumeProperties(String storagePath, int maxFileSizeMb) {
    public ResumeProperties {
        if (storagePath == null || storagePath.isBlank()) storagePath = "./runtime/resumes";
        if (maxFileSizeMb < 1) maxFileSizeMb = 5;
    }
    public long maxFileSizeBytes() { return maxFileSizeMb * 1024L * 1024L; }
}
