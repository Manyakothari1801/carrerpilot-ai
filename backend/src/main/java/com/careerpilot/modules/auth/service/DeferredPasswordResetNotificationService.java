package com.careerpilot.modules.auth.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class DeferredPasswordResetNotificationService implements PasswordResetNotificationService {
    private static final Logger log = LoggerFactory.getLogger(DeferredPasswordResetNotificationService.class);
    @Override public void sendResetInstructions(String email, String rawToken) {
        log.info("Password reset notification requested; delivery provider is deferred to the notification phase");
    }
}
