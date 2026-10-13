# Render

Create separate Render services for Spring Boot and FastAPI. Configure health checks as follows:

- Backend: `/actuator/health/readiness` (checks application readiness, PostgreSQL, and JWT configuration)
- ML service: `/health` (checks that the versioned model artifact loaded)

Backend environment variable names: `SPRING_PROFILES_ACTIVE=prod`, `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `FRONTEND_ORIGIN`, `JWT_SECRET`, `JWT_ACCESS_EXPIRATION`, `JWT_REFRESH_EXPIRATION`, `AI_ENABLED`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `GEMINI_FALLBACK_MODELS`, `AI_CONNECT_TIMEOUT`, `AI_REQUEST_TIMEOUT`, `ML_SERVICE_URL`, `ML_CONNECT_TIMEOUT`, `ML_READ_TIMEOUT`, `APP_FRONTEND_URL`, and the existing mail variables when email is enabled. Use the private Render URL for `ML_SERVICE_URL` when both services are in the same region.

ML environment variable names: `CAREER_MODEL_PATH` only when the artifact is not at the image default. Do not place Gemini or database credentials in the ML service.

Never put secret values in this file. Render's secret environment settings remain the source of truth.

