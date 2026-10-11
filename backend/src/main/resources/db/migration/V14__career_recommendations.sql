CREATE TABLE career_recommendations (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    model_version VARCHAR(100) NOT NULL,
    feature_schema_version VARCHAR(100) NOT NULL,
    degree VARCHAR(120),
    experience_level VARCHAR(30),
    target_role VARCHAR(120),
    created_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_career_recommendations_user_history ON career_recommendations(user_id, created_at DESC);

CREATE TABLE career_recommendation_items (
    id UUID PRIMARY KEY,
    recommendation_id UUID NOT NULL REFERENCES career_recommendations(id) ON DELETE CASCADE,
    recommendation_rank INTEGER NOT NULL CHECK (recommendation_rank BETWEEN 1 AND 5),
    career VARCHAR(160) NOT NULL,
    confidence NUMERIC(8,7) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
    profile_signals TEXT NOT NULL,
    UNIQUE (recommendation_id, recommendation_rank)
);
CREATE INDEX idx_career_recommendation_items_parent ON career_recommendation_items(recommendation_id);

