CREATE TABLE interview_sessions (
    id UUID PRIMARY KEY, user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_career VARCHAR(120) NOT NULL, interview_type VARCHAR(30) NOT NULL,
    mode VARCHAR(10) NOT NULL CHECK (mode IN ('TEXT','VIDEO')), focus_area VARCHAR(120),
    question_count INTEGER NOT NULL CHECK (question_count IN (3,5,10)), status VARCHAR(20) NOT NULL,
    current_question TEXT NOT NULL, completed_answers INTEGER NOT NULL DEFAULT 0,
    overall_coaching_score INTEGER, provider VARCHAR(40), model VARCHAR(120),
    started_at TIMESTAMPTZ NOT NULL, completed_at TIMESTAMPTZ, updated_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_interview_sessions_user ON interview_sessions(user_id, started_at DESC);

CREATE TABLE interview_answers (
    id UUID PRIMARY KEY, session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
    sequence_number INTEGER NOT NULL, question TEXT NOT NULL, transcript TEXT NOT NULL,
    strengths TEXT, needs_improvement TEXT, next_focus VARCHAR(500), suggested_answer TEXT, topics_to_review TEXT,
    technical_correctness INTEGER NOT NULL, relevance INTEGER NOT NULL, answer_structure INTEGER NOT NULL,
    completeness INTEGER NOT NULL, communication_clarity INTEGER NOT NULL,
    answer_duration_seconds INTEGER, created_at TIMESTAMPTZ NOT NULL,
    UNIQUE(session_id, sequence_number)
);
CREATE INDEX idx_interview_answers_session ON interview_answers(session_id, sequence_number);
