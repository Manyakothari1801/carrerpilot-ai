package com.careerpilot.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import java.time.Duration;

@ConfigurationProperties(prefix = "careerpilot.security")
public record SecurityProperties(String jwtSecret, Duration accessExpiration, Duration refreshExpiration) { }
