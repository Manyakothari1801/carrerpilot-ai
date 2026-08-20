package com.careerpilot.security;

import com.careerpilot.modules.auth.entity.User;
import com.careerpilot.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class CurrentUser {
    private CurrentUser() { }
    public static User require() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) throw new UnauthorizedException("Authentication is required");
        return user;
    }
}
