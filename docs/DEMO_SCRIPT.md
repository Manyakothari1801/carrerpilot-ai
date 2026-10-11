# Faculty demo script (7–10 minutes)

## 1. Problem and architecture — 45 seconds

Explain that students currently use disconnected tools for resumes, career discovery, development planning, and placement preparation. Show the architecture diagram and state that Spring Boot is the single secure API boundary.

## 2. Login, profile, and skills — 45 seconds

Sign in with a prepared demo student. Open Profile, show academic/career information and saved proficiency-tagged skills. Mention JWT authentication and owner-scoped records.

## 3. Resume and ATS — 60 seconds

Open an already uploaded PDF/DOCX, show parsed sections, then open a persisted analysis. Explain that ATS scoring is deterministic and versioned. Avoid waiting for a fresh upload unless specifically requested.

## 4. Gemini Resume Coach — 45 seconds

Show persisted Gemini suggestions and clarify that Gemini only supplies qualitative writing feedback; it never changes ATS scoring. If unavailable, show the truthful PARTIAL state and continue using deterministic findings.

## 5. Job Match — 60 seconds

Open a saved Resume–JD comparison. Explain skill classification, TF-IDF/cosine keyword similarity, contextual requirements, nullable semantic similarity, and transparent weight redistribution.

## 6. ML career recommendations — 60 seconds

Show ranked recommendations, probabilities, model/schema versions, and saved history. State that Logistic Regression is trained on a reproducible synthetic/curated dataset and probabilities are not career guarantees. If FastAPI is unavailable, show history and explain graceful unavailability.

## 7. Career plan and readiness — 60 seconds

Select the persisted career plan. Show skill gaps, ordered roadmap, user-tracked progress, and readiness evidence. Explicitly say Placement Readiness is an explainable preparation index, not hiring probability.

## 8. Assessment scheduling and web handoff — 75 seconds

In mobile, browse the real catalog and show schedule/reschedule/cancel behavior. Use **Take Assessment on Web** to explain the security boundary. In web, show a completed server-graded result or a prepared in-progress attempt. Do not attempt a full timed test during the demo.

## 9. Technical distinction and close — 45 seconds

Summarize: Logistic Regression is ML, Gemini is an LLM, ATS/Job Match/readiness are deterministic, and the integrated product is the AI platform. End with limitations: synthetic ML data, optional external providers, LAN-dependent local mobile setup, and web-only exam execution.

## Demo safety checklist

- Start PostgreSQL, FastAPI, Spring Boot, and web before the session; verify their health endpoints.
- Use persisted results so external-provider latency cannot block the demonstration.
- Keep Gemini disabled or use PARTIAL fallback if quota/network is unreliable.
- If FastAPI is unavailable, show persisted recommendation history and the versioned training evidence.
- Keep one completed assessment result ready; emails can be explained without sending live mail.
