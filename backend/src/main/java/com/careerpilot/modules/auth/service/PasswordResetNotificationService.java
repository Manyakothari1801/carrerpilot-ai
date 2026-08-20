package com.careerpilot.modules.auth.service;

public interface PasswordResetNotificationService {
    void sendResetInstructions(String email, String rawToken);
}
