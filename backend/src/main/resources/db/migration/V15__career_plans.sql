CREATE TABLE career_plans (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    recommendation_id UUID NOT NULL REFERENCES career_recommendations(id) ON DELETE RESTRICT,
    selected_career VARCHAR(160) NOT NULL,
    taxonomy_version VARCHAR(80) NOT NULL,
    readiness_version VARCHAR(80) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE career_roadmap_items (
    id UUID PRIMARY KEY,
    career_plan_id UUID NOT NULL REFERENCES career_plans(id) ON DELETE CASCADE,
    stage_order INTEGER NOT NULL,
    stage_name VARCHAR(100) NOT NULL,
    item_order INTEGER NOT NULL,
    topic VARCHAR(160) NOT NULL,
    skill_name VARCHAR(120),
    why_it_matters VARCHAR(700) NOT NULL,
    next_action VARCHAR(700) NOT NULL,
    status VARCHAR(30) NOT NULL CHECK (status IN ('NOT_STARTED','IN_PROGRESS','READY')),
    status_source VARCHAR(30) NOT NULL CHECK (status_source IN ('PROFILE_EVIDENCE','SYSTEM_EVIDENCE','USER_REPORTED','PLANNED')),
    updated_at TIMESTAMPTZ NOT NULL,
    UNIQUE (career_plan_id, item_order)
);
CREATE INDEX idx_career_roadmap_plan ON career_roadmap_items(career_plan_id, stage_order, item_order);

