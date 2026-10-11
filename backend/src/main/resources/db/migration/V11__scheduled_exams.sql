CREATE TABLE scheduled_exams (
 id UUID PRIMARY KEY, assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE RESTRICT,
 title VARCHAR(180) NOT NULL, instructions VARCHAR(2000), scheduled_start TIMESTAMPTZ NOT NULL,
 scheduled_end TIMESTAMPTZ NOT NULL, status VARCHAR(20) NOT NULL,
 created_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
 created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL,
 CONSTRAINT ck_scheduled_exam_window CHECK (scheduled_end > scheduled_start)
);
CREATE INDEX idx_scheduled_exams_window ON scheduled_exams(scheduled_start,scheduled_end);
CREATE INDEX idx_scheduled_exams_status ON scheduled_exams(status);

CREATE TABLE scheduled_exam_candidates (
 id UUID PRIMARY KEY, scheduled_exam_id UUID NOT NULL REFERENCES scheduled_exams(id) ON DELETE CASCADE,
 candidate_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 attempt_id UUID UNIQUE REFERENCES assessment_attempts(id) ON DELETE RESTRICT,
 assignment_status VARCHAR(20) NOT NULL, assigned_at TIMESTAMPTZ NOT NULL,
 started_at TIMESTAMPTZ, completed_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL,
 updated_at TIMESTAMPTZ NOT NULL,
 CONSTRAINT uk_scheduled_exam_candidate UNIQUE(scheduled_exam_id,candidate_user_id)
);
CREATE INDEX idx_exam_candidates_candidate ON scheduled_exam_candidates(candidate_user_id);
CREATE INDEX idx_exam_candidates_exam ON scheduled_exam_candidates(scheduled_exam_id);
CREATE INDEX idx_exam_candidates_status ON scheduled_exam_candidates(assignment_status);
