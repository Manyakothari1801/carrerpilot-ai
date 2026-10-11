# Assessment architecture

Phase 6 provides three server-graded MCQ categories: `TECHNICAL_MCQ`, `APTITUDE_MCQ`, and `ROLE_BASED_MCQ`. Each seeded template has a 15-question bank. Every start randomly selects and orders 10 questions, then persists that immutable selection in `assessment_attempt_questions`. Refreshing an attempt therefore returns the same questions in the same order, while a later attempt is selected independently. Submitted attempts and their answers are immutable history records.

Correct option flags and explanations are stored only on the backend. Catalog, assessment-detail, and in-progress-attempt responses expose question and option text but never answer keys. Submission accepts question IDs and selected option keys; the backend validates ownership, status, question membership, duplicates, and options before deterministically grading the attempt.

Grading accepts answers only for the persisted attempt question set. Attempts created before the selection table existed remain readable through a compatibility rule that uses the original ordered questions up to the attempt's stored `total_questions` value.

The expiry policy is server-authoritative: an in-progress attempt becomes `EXPIRED` when the current server time reaches `started_at + duration`. Expired attempts are not auto-submitted and cannot accept answers. The browser timer derives its remaining time from the server-provided timestamps and resumes after refresh.

Result analytics are computed from persisted per-question results. Skill and difficulty breakdowns report correct, total, and percentage. Strongest and weakest topics are omitted when no result data exists.

AI generation is optional and never required for taking or grading stored assessments. When enabled, the Gemini draft provider uses structured JSON, bounded retries for transient failures, live Flash-model fallback, and safe metadata-only diagnostics. Drafts pass deterministic validation before they can be used: exactly four unique A–D options, one correct answer, allowed skill tags, length limits, valid difficulty, and normalized duplicate-question detection. Provider failure returns no drafts and does not affect the catalog or grading.
