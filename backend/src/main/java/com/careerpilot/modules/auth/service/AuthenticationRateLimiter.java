package com.careerpilot.modules.auth.service;

/** Hook for a distributed rate limiter. Deployment must bind this to gateway/Redis controls before production. */
public interface AuthenticationRateLimiter { void check(String operation, String key); }
