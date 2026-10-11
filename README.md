# Career Guidance AI

Official academic title: **Intelligent Career Guidance and Resume Optimization Platform Using AI**.

## Problem Statement

Students often manage resumes, career exploration, skill planning, and placement preparation across disconnected tools. Career Guidance AI provides one authenticated, explainable platform for managing this journey while keeping high-impact scores deterministic and auditable.

## Key Features

- Student authentication, profile, skills, and protected ownership boundaries
- PDF/DOCX resume management, parsing, deterministic ATS analysis, and optional Gemini writing feedback
- Deterministic resume-to-job-description matching with persisted history
- Profile-based trained career recommendations with persisted history
- Career skill gaps, a staged roadmap, and transparent Placement Readiness
- Stored assessments, deterministic server-side grading, result history, scheduling, rescheduling, cancellation, and email reminders
- React web application for the complete experience and secure assessment attempts
- Expo mobile companion for profiles, resumes, careers, plans, assessment management, and results

## System Architecture

The Spring Boot modular monolith is the only public data API. React Web and React Native Mobile call it over authenticated REST. PostgreSQL stores application state and Flyway owns schema evolution. Spring Boot calls Gemini only for optional Resume Coach feedback and calls a private FastAPI service only for career recommendations. See [architecture](docs/ARCHITECTURE.md).

## Technology Stack

- Web: React 19, TypeScript, Vite, React Router, TanStack Query, Tailwind CSS
- Mobile: React Native, Expo SDK 57, Expo Router, Axios, SecureStore
- Backend: Java 21, Spring Boot 3, Spring Security, Spring Data JPA, Flyway, Maven
- Data: PostgreSQL 16 with pgvector-compatible image
- ML service: Python 3.11, FastAPI, scikit-learn, joblib
- Optional LLM: Google Gemini

## AI vs ML vs LLM Components

- **AI platform:** the complete integrated decision-support application.
- **ML:** a trained multiclass Logistic Regression model served through FastAPI for profile-based career recommendations. Its bundled dataset is synthetic/curated academic prototype data.
- **LLM:** Gemini Resume Coach provides optional qualitative writing feedback. It never changes deterministic ATS scores.
- **Deterministic algorithms:** ATS analysis, Job Match, skill-gap classification, roadmap generation, Placement Readiness, assessment selection, and grading.

## Web vs Mobile Responsibilities

Both clients support authenticated career-companion workflows. Actual assessment questions, timer, answer controls, proctoring boundaries, and submission remain **web-only**. Mobile schedules and manages assessments, displays summary history, and opens the established web scheduling route. Browser sign-in may be required; tokens are never transferred through URLs.

## Repository Structure

```text
backend/       Spring Boot REST API and Flyway migrations
frontend/      React web application
mobile/        Expo mobile companion
ml-service/    FastAPI inference service and reproducible training pipeline
docs/          Architecture, privacy, runbook, demo, and viva documentation
infra/         Infrastructure placeholders/configuration
```

## Prerequisites

Java 21, Node.js 20+, Docker Desktop, Python 3.11, and PowerShell. Android development additionally requires an emulator or Expo-compatible device; cloud EAS builds require an Expo account only when the developer deliberately runs them.

## Environment Setup

Use [backend/.env.example](backend/.env.example), [frontend/.env.example](frontend/.env.example), [mobile/.env.example](mobile/.env.example), and [ml-service/.env.example](ml-service/.env.example). These contain placeholders or local-only defaults, never production secrets. Spring does not automatically load `.env`; set variables in PowerShell or an IDE.

## Database Setup

```powershell
docker compose up -d postgres
docker compose ps
docker port careerpilot-postgres
```

PostgreSQL is exposed on host port `5433` and remains on `5432` inside the container. The named volume preserves data during normal restarts. Never use `docker compose down -v` when the data must be retained.

## ML Model Training

Training is required only if `ml-service/models/career_model.joblib` is absent:

```powershell
cd ml-service
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python training/generate_curated_dataset.py
python -m training.train
```

Seed `497`, model version `career-rec-synthetic-v1`, and feature schema `profile-features-v1` make the prototype reproducible. Synthetic evaluation scores do not establish real-world accuracy, employability, or fairness.

## Running FastAPI

```powershell
cd ml-service
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Verify `http://localhost:8000/health` and `http://localhost:8000/version`.

## Running Spring Boot

```powershell
cd backend
$env:SPRING_PROFILES_ACTIVE='local'
$env:PORT='8081'
$env:DB_URL='jdbc:postgresql://localhost:5433/careerpilot'
$env:DB_USERNAME='careerpilot'
$env:DB_PASSWORD='careerpilot_local'
$env:JWT_SECRET='<at-least-32-random-characters>'
$env:FRONTEND_ORIGIN='http://localhost:5173'
$env:ML_SERVICE_URL='http://localhost:8000'
.\mvnw.cmd spring-boot:run
```

## Running Web

```powershell
cd frontend
$env:VITE_API_BASE_URL='http://localhost:8081/api/v1'
npm install
npm run dev
```

## Running Mobile

Android emulator:

```powershell
cd mobile
$env:EXPO_PUBLIC_API_BASE_URL='http://10.0.2.2:8081/api/v1'
$env:EXPO_PUBLIC_WEB_APP_URL='http://10.0.2.2:5173'
npm install
npm start
```

For a physical phone, replace `10.0.2.2` with the active PC LAN IPv4 address and allow ports 8081 and 5173 on the private-network firewall. The phone and PC must be on the same network.

## Android Build

The Android package is `com.careerguidanceai.mobile`. Increment `expo.version` and `android.versionCode` for releases.

```powershell
cd mobile
npx eas-cli build --platform android --profile preview     # installable demo APK
npx eas-cli build --platform android --profile production  # store-style AAB
```

These commands intentionally require an external Expo login and upload; they are not run automatically.

## Testing

```powershell
cd backend
.\mvnw.cmd clean test
.\mvnw.cmd package -DskipTests

cd ..\frontend
npm run lint
npm run build

cd ..\mobile
npm run typecheck
npx expo-doctor --verbose
npx expo export --platform android

cd ..\ml-service
.\.venv\Scripts\Activate.ps1
python -m pytest -q
```

## Security

JWT access and refresh tokens are stored in Expo SecureStore on mobile. AsyncStorage contains only theme and onboarding preferences. Resume, recommendation, plan, schedule, and attempt access is owner-scoped in Spring Boot. Gemini keys, mail credentials, database secrets, and JWT secrets remain backend-only. Server errors do not expose stack traces.

## Limitations

- The career dataset is small, synthetic, and limited to authored career archetypes.
- Gemini, email, and semantic embeddings depend on optional external configuration and availability.
- Semantic Job Match is unavailable when no embedding provider is configured; weights are redistributed transparently.
- Mobile assessment execution is intentionally unsupported; students use the web application.
- Local physical-device networking depends on LAN and firewall configuration.

## Future Scope

Future academic work may evaluate recommendations on consented real-world data, study fairness, add institution-specific roles, and improve secure deployment/observability. The current product is feature-complete; future work is not required for the present demonstration.

For the exact Windows startup sequence use [RUNBOOK.md](docs/RUNBOOK.md). Faculty demonstrations can follow [DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md), with concise defense preparation in [VIVA_NOTES.md](docs/VIVA_NOTES.md).
