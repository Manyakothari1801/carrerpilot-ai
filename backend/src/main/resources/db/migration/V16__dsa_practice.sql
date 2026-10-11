CREATE TABLE dsa_topic_progress (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id VARCHAR(60) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('NOT_STARTED','ATTEMPTED','SOLVED','REVISE')),
    attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
    self_confidence SMALLINT CHECK (self_confidence BETWEEN 1 AND 5),
    last_practiced_at TIMESTAMPTZ,
    solved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    UNIQUE (user_id, topic_id)
);

CREATE INDEX idx_dsa_progress_user ON dsa_topic_progress(user_id, updated_at DESC);
