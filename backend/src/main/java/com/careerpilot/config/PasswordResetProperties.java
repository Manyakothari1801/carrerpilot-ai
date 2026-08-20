package com.careerpilot.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import java.time.Duration;

@ConfigurationProperties(prefix = "careerpilot.password-reset")
public record PasswordResetProperties(Duration expiration, boolean exposeLocalToken) { }
