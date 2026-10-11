# Student self-scheduling

Phase 7A uses a student-owned flow: Assessment Catalog → Schedule Test → My Scheduled Exams → optional Reschedule → exam window opens → Phase 6 Assessment Attempt → Submission → Result.

`POST /api/v1/student/scheduled-exams` accepts only an assessment ID and future start instant. The authenticated JWT student becomes the owner; the server derives the end from assessment duration. Owner-scoped list, detail, reschedule, cancel, and start endpoints never accept a user ID. Rescheduling is allowed only before start, recalculates the end, increments a counter, and writes `scheduled_exam_reschedule_history`. Cancellation is idempotent and never deletes a row.

Start locks the owned schedule, validates server time, and reuses or creates one Phase 6 attempt. States are computed as `UPCOMING`, `AVAILABLE`, `IN_PROGRESS`, `COMPLETED`, `MISSED`, or `CANCELLED`.

V11 admin-created rows and `scheduled_exam_candidates` are retained unchanged for audit/history. Their V12 `owner_user_id` remains null because ownership cannot be inferred safely, so they are excluded from student APIs. Old `/api/v1/scheduled-exams/**` administration routes are denied and no admin scheduling controller exists.

Local PostgreSQL remains `jdbc:postgresql://localhost:5433/careerpilot`. Timestamps are stored as `TIMESTAMPTZ` and displayed in browser-local time. Email/reminders and all proctoring features are not implemented.
