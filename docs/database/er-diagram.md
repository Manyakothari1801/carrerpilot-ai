# Database model

Phase 1 creates only Flyway history, the pgvector extension, and a `schema_metadata` foundation table. The following target model guides later incremental migrations.

```mermaid
erDiagram
    USERS ||--o| PROFILES : has
    USERS ||--o{ REFRESH_TOKENS : owns
    USERS ||--o{ USER_SKILLS : possesses
    SKILLS ||--o{ USER_SKILLS : classifies
    USERS ||--o{ RESUMES : uploads
    RESUMES ||--o{ RESUME_ANALYSES : analyzed
    USERS ||--o{ JOB_DESCRIPTIONS : submits
    RESUMES ||--o{ JOB_MATCHES : compared
    JOB_DESCRIPTIONS ||--o{ JOB_MATCHES : matched
    JOB_MATCHES ||--o{ SKILL_GAPS : reveals
    JOB_MATCHES ||--o{ ROADMAPS : generates
    ROADMAPS ||--o{ ROADMAP_ITEMS : contains
    USERS ||--o{ ASSESSMENTS : owns
    ASSESSMENTS ||--o{ ASSESSMENT_QUESTIONS : contains
    QUESTIONS ||--o{ ASSESSMENT_QUESTIONS : assigned
    USERS ||--o{ EXAM_SCHEDULES : schedules
    ASSESSMENTS ||--o{ EXAM_SCHEDULES : scheduled_as
    EXAM_SCHEDULES ||--o{ EXAM_ATTEMPTS : starts
    EXAM_ATTEMPTS ||--o{ ANSWERS : records
    EXAM_ATTEMPTS ||--o{ PROCTORING_EVENTS : logs
    EXAM_ATTEMPTS ||--o| PERFORMANCE_REPORTS : produces
    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--o{ CHAT_SESSIONS : starts
    CHAT_SESSIONS ||--o{ CHAT_MESSAGES : contains
```

## Conventions

- UUID domain primary keys
- UTC `TIMESTAMPTZ` audit columns
- foreign keys and ownership indexes
- readable string status values with database checks where stable
- partial unique index for one active resume per user
- immutable/versioned analyses, assessments, attempts, and reports
- model and prompt-version metadata for AI-derived records
- vector columns only where semantic retrieval is required

Each future phase owns its Flyway migration. Hibernate remains in `validate` mode and never mutates production schemas.

## Phase 5 job matching

```mermaid
erDiagram
  USERS ||--o{ JOB_MATCHES : owns
  RESUMES ||--o{ JOB_MATCHES : evaluated_for
  JOB_MATCHES ||--o{ JOB_MATCH_SKILLS : records
  JOB_MATCHES {
    uuid id PK
    uuid user_id FK
    uuid resume_id FK
    string job_title
    int overall_match_score
    int keyword_match_score
    int skill_match_score
    int semantic_match_score "nullable"
    string scoring_version
    timestamptz created_at
  }
  JOB_MATCH_SKILLS {
    uuid id PK
    uuid job_match_id FK
    string normalized_skill_name
    string match_status
    string importance
    string priority
  }
```
