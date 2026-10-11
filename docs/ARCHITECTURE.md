# Career Guidance AI architecture

```text
React Web ───────────────┐
                        ├──> Spring Boot REST API ───> PostgreSQL
React Native Mobile ────┘            │
                                     ├──> Gemini API
                                     │    Resume Coach only
                                     │
                                     └──> FastAPI ML Service
                                             │
                                             └──> Logistic Regression model
                                                  Career Recommendation only
```

Spring Boot is the authentication, ownership, validation, orchestration, and persistence boundary. Neither client accesses PostgreSQL, Gemini, or FastAPI directly. The backend remains usable when optional Gemini feedback or ML inference is unavailable; deterministic features do not depend on either provider.

The web application supports the full student workflow, including actual assessment retrieval, timer, answer submission, and result review. Mobile is a student companion: it manages profiles, resumes, career discovery/plans, assessment schedules, and summary results. It never downloads the question bank or starts/submits an assessment.

Component classifications:

- Trained ML: profile features → TF-IDF feature text → Logistic Regression `predict_proba` → ranked careers.
- LLM: bounded, schema-validated Gemini feedback for resume writing only.
- Deterministic: ATS, Job Match, skill gap, roadmap, readiness, assessment grading, and scheduling state.
- Persistence: PostgreSQL schema V1–V15, migrated only through immutable Flyway files.
