CREATE TABLE resume_analyses (
    id UUID PRIMARY KEY,
    resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING','PROCESSING','COMPLETED','PARTIAL','FAILED')),
    overall_score INTEGER NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
    ats_score INTEGER NOT NULL CHECK (ats_score BETWEEN 0 AND 100),
    section_score INTEGER NOT NULL CHECK (section_score BETWEEN 0 AND 100),
    keyword_score INTEGER NOT NULL CHECK (keyword_score BETWEEN 0 AND 100),
    action_verb_score INTEGER NOT NULL CHECK (action_verb_score BETWEEN 0 AND 100),
    quantification_score INTEGER NOT NULL CHECK (quantification_score BETWEEN 0 AND 100),
    readability_score INTEGER NOT NULL CHECK (readability_score BETWEEN 0 AND 100),
    model_provider VARCHAR(40),
    model_name VARCHAR(100),
    prompt_version VARCHAR(60) NOT NULL,
    scoring_version VARCHAR(60) NOT NULL,
    ai_message VARCHAR(500),
    input_truncated BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_resume_analyses_history ON resume_analyses(resume_id, created_at DESC);

CREATE TABLE analysis_findings (
    id UUID PRIMARY KEY,
    analysis_id UUID NOT NULL REFERENCES resume_analyses(id) ON DELETE CASCADE,
    finding_type VARCHAR(30) NOT NULL CHECK (finding_type IN ('STRENGTH','WEAKNESS','MISSING_SECTION','KEYWORD','ACTION_VERB','QUANTIFICATION','READABILITY','FORMATTING','GRAMMAR','REWRITE')),
    category VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('INFO','LOW','MEDIUM','HIGH')),
    title VARCHAR(200) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    original_text TEXT,
    suggested_text TEXT,
    sequence_order INTEGER NOT NULL CHECK (sequence_order >= 0),
    created_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_analysis_findings_analysis ON analysis_findings(analysis_id, sequence_order);
