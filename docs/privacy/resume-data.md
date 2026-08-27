# Resume data privacy and retention

Upload and deterministic parsing/scoring occur entirely inside the CareerPilot backend. No content is sent to an AI provider during upload, parsing, or rule-based scoring.

When `AI_ENABLED=true` and a Gemini key is configured, creating an analysis sends only bounded parsed non-contact resume sections required for writing feedback to Gemini. Internal IDs, account details, storage paths, files, checksums, and contact sections are excluded. AI may be disabled without affecting deterministic analysis. Provider prompts, API keys, full resume text, raw provider payloads, and provider error bodies are not logged or persisted. The API key is supplied only to the backend through the `x-goog-api-key` request header and is never returned to the browser.

In the local profile, original files are stored under `RESUME_STORAGE_PATH` (default `backend/runtime/resumes` when the backend is started from its directory). Generated UUID object keys are used as filenames; the user-supplied filename is metadata only. The directory is ignored by Git. Database records store metadata and deterministic parsed sections, never an absolute filesystem path.

Deleting a resume first validates ownership and deletes the local object. If object deletion fails, the database record is retained so the failure can be retried rather than silently orphaning private data. After successful object deletion, sections and metadata are removed transactionally. If the deleted resume was active, the newest remaining resume becomes active.

There is no automatic expiration in Phase 3. Files remain until the user deletes them or the local development environment is removed. Production should implement an S3-compatible `ResumeStorageService`, encrypted storage, backups and lifecycle/retention policies without changing resume-domain logic.

Uploading the same file twice for the same user returns the existing resume based on SHA-256 checksum. Checksums are scoped by user and never used to reveal another user's uploads.
