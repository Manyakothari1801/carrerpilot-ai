CREATE TABLE job_matches (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE RESTRICT,
    job_title VARCHAR(160) NOT NULL,
    company_name VARCHAR(160),
    job_description TEXT NOT NULL,
    overall_match_score INTEGER NOT NULL CHECK (overall_match_score BETWEEN 0 AND 100),
    keyword_match_score INTEGER NOT NULL CHECK (keyword_match_score BETWEEN 0 AND 100),
    skill_match_score INTEGER NOT NULL CHECK (skill_match_score BETWEEN 0 AND 100),
    semantic_match_score INTEGER CHECK (semantic_match_score BETWEEN 0 AND 100),
    experience_match_score INTEGER CHECK (experience_match_score BETWEEN 0 AND 100),
    education_match_score INTEGER CHECK (education_match_score BETWEEN 0 AND 100),
    semantic_status VARCHAR(30) NOT NULL,
    experience_status VARCHAR(30) NOT NULL,
    education_status VARCHAR(30) NOT NULL,
    scoring_version VARCHAR(60) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_job_matches_user_history ON job_matches(user_id, created_at DESC);
CREATE INDEX idx_job_matches_resume ON job_matches(resume_id);

CREATE TABLE job_match_skills (
    id UUID PRIMARY KEY,
    job_match_id UUID NOT NULL REFERENCES job_matches(id) ON DELETE CASCADE,
    skill_name VARCHAR(120) NOT NULL,
    normalized_skill_name VARCHAR(120) NOT NULL,
    match_status VARCHAR(20) NOT NULL CHECK (match_status IN ('MATCHED','PARTIAL','MISSING')),
    importance VARCHAR(20) NOT NULL CHECK (importance IN ('REQUIRED','PREFERRED','OPTIONAL')),
    source VARCHAR(40) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    evidence VARCHAR(500) NOT NULL,
    recommendation VARCHAR(700) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_job_match_skills_match ON job_match_skills(job_match_id);
