ALTER TABLE resume_analyses
    ADD COLUMN primary_model_attempted VARCHAR(100),
    ADD COLUMN fallback_model_used VARCHAR(100),
    ADD COLUMN ai_request_outcome VARCHAR(40);
