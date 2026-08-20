package com.careerpilot.modules.auth.service;

import com.careerpilot.config.PasswordResetProperties;
import com.careerpilot.config.SecurityProperties;
import com.careerpilot.exception.ConflictException;
import com.careerpilot.exception.UnauthorizedException;
import com.careerpilot.modules.auth.dto.*;
import com.careerpilot.modules.auth.entity.*;
import com.careerpilot.modules.auth.repository.*;
import com.careerpilot.modules.profile.entity.Profile;
import com.careerpilot.modules.profile.repository.ProfileRepository;
import com.careerpilot.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Locale;

@Service
public class AuthService {
    private static final String GENERIC_RESET_MESSAGE = "If the account exists, reset instructions have been prepared";
    private final UserRepository users; private final ProfileRepository profiles; private final RefreshTokenRepository refreshTokens;
    private final PasswordResetTokenRepository resetTokens; private final PasswordEncoder passwords; private final JwtService jwt;
    private final TokenHashService tokens; private final SecurityProperties security; private final PasswordResetProperties resetProperties;
    private final PasswordResetNotificationService notifications; private final AuthenticationRateLimiter rateLimiter;

    public AuthService(UserRepository users, ProfileRepository profiles, RefreshTokenRepository refreshTokens,
                       PasswordResetTokenRepository resetTokens, PasswordEncoder passwords, JwtService jwt,
                       TokenHashService tokens, SecurityProperties security, PasswordResetProperties resetProperties,
                       PasswordResetNotificationService notifications, AuthenticationRateLimiter rateLimiter) {
        this.users=users; this.profiles=profiles; this.refreshTokens=refreshTokens; this.resetTokens=resetTokens;
        this.passwords=passwords; this.jwt=jwt; this.tokens=tokens; this.security=security; this.resetProperties=resetProperties;
        this.notifications=notifications; this.rateLimiter=rateLimiter;
    }

    @Transactional public AuthResponse register(RegisterRequest request, String device) {
        if (!request.password().equals(request.confirmPassword())) throw new com.careerpilot.exception.ApiException(org.springframework.http.HttpStatus.BAD_REQUEST, "Passwords do not match");
        String email = normalizeEmail(request.email());
        if (users.existsByEmail(email)) throw new ConflictException("An account with this email already exists");
        User user = new User(); user.setFullName(request.fullName().trim()); user.setEmail(email); user.setPasswordHash(passwords.encode(request.password()));
        user.setRole(Role.STUDENT); user.setAccountStatus(AccountStatus.ACTIVE); users.save(user);
        Profile profile = new Profile(); profile.setUser(user); profile.setProfileCompletionPercentage(10); profiles.save(profile);
        return issue(user, device);
    }

    @Transactional public AuthResponse login(LoginRequest request, String device) {
        String email = normalizeEmail(request.email()); rateLimiter.check("login", email);
        User user = users.findByEmail(email).orElseThrow(() -> invalidCredentials());
        if (!user.isEnabled() || !user.isAccountNonLocked() || !passwords.matches(request.password(), user.getPasswordHash())) throw invalidCredentials();
        return issue(user, device);
    }

    @Transactional public AuthResponse refresh(String rawToken, String device) {
        RefreshToken old = refreshTokens.findByTokenHash(tokens.hash(rawToken)).orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));
        if (old.isRevoked() || old.getExpiresAt().isBefore(Instant.now())) throw new UnauthorizedException("Refresh token is invalid or expired");
        old.setRevoked(true); old.setRevokedAt(Instant.now());
        return issue(old.getUser(), device);
    }

    @Transactional public void logout(String rawToken) {
        refreshTokens.findByTokenHash(tokens.hash(rawToken)).ifPresent(token -> { token.setRevoked(true); token.setRevokedAt(Instant.now()); });
    }

    @Transactional public void logoutAll(User user) { refreshTokens.revokeAll(user.getId(), Instant.now()); }

    @Transactional public MessageResponse forgotPassword(String emailValue) {
        String email = normalizeEmail(emailValue); rateLimiter.check("forgot", email);
        final String[] exposed = {null};
        users.findByEmail(email).ifPresent(user -> {
            String raw = tokens.generate(); PasswordResetToken entity = new PasswordResetToken(); entity.setTokenHash(tokens.hash(raw));
            entity.setUser(user); entity.setExpiresAt(Instant.now().plus(resetProperties.expiration())); resetTokens.save(entity);
            notifications.sendResetInstructions(email, raw); if (resetProperties.exposeLocalToken()) exposed[0] = raw;
        });
        return new MessageResponse(GENERIC_RESET_MESSAGE, exposed[0]);
    }

    @Transactional public void resetPassword(ResetPasswordRequest request) {
        if (!request.password().equals(request.confirmPassword())) throw new com.careerpilot.exception.ApiException(org.springframework.http.HttpStatus.BAD_REQUEST, "Passwords do not match");
        PasswordResetToken token = resetTokens.findByTokenHash(tokens.hash(request.token()))
                .orElseThrow(() -> new com.careerpilot.exception.ApiException(org.springframework.http.HttpStatus.BAD_REQUEST, "Reset token is invalid or expired"));
        if (token.isUsed() || token.getExpiresAt().isBefore(Instant.now())) throw new com.careerpilot.exception.ApiException(org.springframework.http.HttpStatus.BAD_REQUEST, "Reset token is invalid or expired");
        token.setUsed(true); token.setUsedAt(Instant.now()); token.getUser().setPasswordHash(passwords.encode(request.password()));
        refreshTokens.revokeAll(token.getUser().getId(), Instant.now());
    }

    public UserSummary summary(User user) { return new UserSummary(user.getId(), user.getFullName(), user.getEmail(), user.getRole()); }

    private AuthResponse issue(User user, String device) {
        JwtService.TokenValue access = jwt.createAccessToken(user); String rawRefresh = tokens.generate();
        RefreshToken refresh = new RefreshToken(); refresh.setTokenHash(tokens.hash(rawRefresh)); refresh.setUser(user);
        refresh.setExpiresAt(Instant.now().plus(security.refreshExpiration())); refresh.setDeviceMetadata(trim(device, 300)); refreshTokens.save(refresh);
        return new AuthResponse(access.value(), rawRefresh, access.expiresAt(), summary(user));
    }
    private UnauthorizedException invalidCredentials() { return new UnauthorizedException("Invalid email or password"); }
    private String normalizeEmail(String email) { return email.trim().toLowerCase(Locale.ROOT); }
    private String trim(String value, int max) { return value == null ? null : value.substring(0, Math.min(value.length(), max)); }
}
