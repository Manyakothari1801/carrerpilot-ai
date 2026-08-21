# Resume data privacy and retention

Phase 3 processes resumes entirely inside the CareerPilot backend. No resume file, extracted text, metadata, or contact information is sent to Gemini or any other third-party AI provider.

In the local profile, original files are stored under `RESUME_STORAGE_PATH` (default `backend/runtime/resumes` when the backend is started from its directory). Generated UUID object keys are used as filenames; the user-supplied filename is metadata only. The directory is ignored by Git. Database records store metadata and deterministic parsed sections, never an absolute filesystem path.

Deleting a resume first validates ownership and deletes the local object. If object deletion fails, the database record is retained so the failure can be retried rather than silently orphaning private data. After successful object deletion, sections and metadata are removed transactionally. If the deleted resume was active, the newest remaining resume becomes active.

There is no automatic expiration in Phase 3. Files remain until the user deletes them or the local development environment is removed. Production should implement an S3-compatible `ResumeStorageService`, encrypted storage, backups and lifecycle/retention policies without changing resume-domain logic.

Uploading the same file twice for the same user returns the existing resume based on SHA-256 checksum. Checksums are scoped by user and never used to reveal another user's uploads.
