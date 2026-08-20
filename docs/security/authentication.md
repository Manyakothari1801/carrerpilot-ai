# Authentication design

CareerPilot uses short-lived signed JWT access tokens and opaque, rotating refresh tokens. Only hashes of refresh and password-reset tokens are stored. Passwords use BCrypt. Reset tokens expire, are single-use, and a successful password reset revokes every refresh session.

The browser keeps tokens in `sessionStorage`, limiting persistence to the current tab/session while allowing Axios to rotate expired access tokens. This Phase 2 compromise remains exposed to XSS. Production should move refresh tokens to `Secure`, `HttpOnly`, `SameSite` cookies and keep access tokens in memory after deployment topology and CSRF policy are established.

Forgot-password responses do not disclose account existence. Only the local profile may return a development reset token when `EXPOSE_LOCAL_RESET_TOKEN=true`. Production must leave this disabled. Delivery is abstracted by `PasswordResetNotificationService` and deferred to the notification phase.

Authentication entry points use an in-memory rate-limit hook. Replace it with a distributed implementation before horizontally scaled production deployment.
