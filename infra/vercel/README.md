# Vercel

Set `VITE_API_BASE_URL` to the public HTTPS Spring Boot URL including `/api/v1`, for example `https://your-backend.onrender.com/api/v1`. Vite embeds this non-secret value at build time, so redeploy after changing it.

Set the backend `FRONTEND_ORIGIN` to the exact production Vercel origin (scheme and host, no path). Add preview origins explicitly only when they are intentionally trusted; wildcard credentialed CORS is not supported.

Post-deployment checks:

1. `GET /actuator/health/readiness` returns `UP`.
2. A browser `OPTIONS /api/v1/auth/login` from the Vercel origin returns the matching `Access-Control-Allow-Origin`.
3. Invalid credentials return `401` promptly and do not trigger refresh.
4. Login, `/auth/me`, and refresh rotation succeed.
5. Resume analysis returns deterministic scores even while Gemini is rate limited.
6. Career prediction remains usable when `/explain` is temporarily unavailable.

