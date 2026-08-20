package com.careerpilot.modules.auth.controller;

import com.careerpilot.modules.auth.dto.*;
import com.careerpilot.modules.auth.service.AuthService;
import com.careerpilot.security.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService auth;
    public AuthController(AuthService auth) { this.auth = auth; }

    @PostMapping("/register") @ResponseStatus(HttpStatus.CREATED) @SecurityRequirements
    @Operation(summary = "Register a student account")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request, HttpServletRequest http) { return auth.register(request, http.getHeader("User-Agent")); }

    @PostMapping("/login") @SecurityRequirements @Operation(summary = "Sign in")
    public AuthResponse login(@Valid @RequestBody LoginRequest request, HttpServletRequest http) { return auth.login(request, http.getHeader("User-Agent")); }

    @PostMapping("/refresh") @SecurityRequirements @Operation(summary = "Rotate a refresh token")
    public AuthResponse refresh(@Valid @RequestBody RefreshRequest request, HttpServletRequest http) { return auth.refresh(request.refreshToken(), http.getHeader("User-Agent")); }

    @PostMapping("/logout") @Operation(summary = "Revoke the current refresh-token session")
    public MessageResponse logout(@Valid @RequestBody RefreshRequest request) { auth.logout(request.refreshToken()); return new MessageResponse("Logged out"); }

    @PostMapping("/logout-all") @Operation(summary = "Revoke all refresh-token sessions")
    public MessageResponse logoutAll() { auth.logoutAll(CurrentUser.require()); return new MessageResponse("Logged out from all sessions"); }

    @PostMapping("/forgot-password") @SecurityRequirements
    public MessageResponse forgot(@Valid @RequestBody ForgotPasswordRequest request) { return auth.forgotPassword(request.email()); }

    @PostMapping("/reset-password") @SecurityRequirements
    public MessageResponse reset(@Valid @RequestBody ResetPasswordRequest request) { auth.resetPassword(request); return new MessageResponse("Password reset successfully"); }

    @GetMapping("/me") public UserSummary me() { return auth.summary(CurrentUser.require()); }
}
