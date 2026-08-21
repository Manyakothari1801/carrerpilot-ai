# CareerPilot AI

CareerPilot AI is a modular career-intelligence and assessment platform for students. Phase 3 adds private PDF/DOCX resume storage, deterministic parsing, active-resume management, and a protected Resume Manager.

## Technology

- Frontend: React, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, Axios, Recharts, and Framer Motion
- Backend: Java 21, Spring Boot 3, Spring Security, Spring Data JPA, Flyway, and PostgreSQL
- Local infrastructure: Docker Compose and pgvector-enabled PostgreSQL

## Architecture

The application is a modular monolith. Backend modules share one deployment and database while keeping domain boundaries explicit. See [system context](docs/architecture/system-context.md) and the [ER model](docs/database/er-diagram.md).

## Local setup

Security and browser-storage decisions are documented in [authentication security](docs/security/authentication.md). PWA verification steps are in [PWA testing](docs/frontend/pwa.md).

Resume storage and privacy behavior are documented in [resume storage](docs/architecture/resume-storage.md) and [resume data privacy](docs/privacy/resume-data.md).

Prerequisites: Java 21, Docker, and Node.js 20 or newer.

```bash
docker compose up -d postgres
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`. Backend health is available at `http://localhost:8080/actuator/health`, and Swagger UI at `http://localhost:8080/swagger-ui.html`.

On Windows, use `mvnw.cmd` instead of `./mvnw`.

## Configuration

Copy values from `backend/.env.example` and `frontend/.env.example` into your local environment. Spring does not load `.env` automatically; Docker Compose and deployment platforms can use these names directly.

No production secrets belong in source control. Local defaults are development-only.

## Verification

```bash
cd backend && ./mvnw clean verify
cd frontend && npm ci && npm run build
```

## Privacy

CareerPilot AI will process resumes and, in later phases, proctoring event data. Read the [proctoring principles](docs/privacy/proctoring.md) and [retention policy](docs/privacy/data-retention.md).

## Current scope

Phase 1 provides infrastructure, configuration, documentation, a secured API foundation, and a clean frontend shell. Authentication and all career-related business features are intentionally deferred.
