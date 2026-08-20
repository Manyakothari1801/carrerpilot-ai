package com.careerpilot.modules.auth.service;

import com.careerpilot.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class InMemoryAuthenticationRateLimiter implements AuthenticationRateLimiter {
    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();
    @Override public void check(String operation, String key) {
        String bucket = operation + ":" + key.toLowerCase();
        Window window = windows.compute(bucket, (ignored, current) -> current == null || current.started.plusSeconds(60).isBefore(Instant.now())
                ? new Window(Instant.now(), 1) : new Window(current.started, current.count + 1));
        if (window.count > 10) throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "Too many requests. Please try again shortly");
    }
    private record Window(Instant started, int count) { }
}
