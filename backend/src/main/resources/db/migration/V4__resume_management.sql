CREATE TABLE resumes (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_filename VARCHAR(255) NOT NULL,
    storage_key VARCHAR(255) NOT NULL UNIQUE,
    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL CHECK (file_size > 0),
    checksum VARCHAR(64) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT FALSE,
    parse_status VARCHAR(20) NOT NULL CHECK (parse_status IN ('UPLOADED','PARSING','PARSED','FAILED')),
    uploaded_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uq_resume_user_checksum UNIQUE (user_id, checksum)
);

CREATE UNIQUE INDEX uq_resume_one_active_per_user ON resumes(user_id) WHERE active;
CREATE INDEX idx_resumes_user_uploaded ON resumes(user_id, uploaded_at DESC);

CREATE TABLE resume_sections (
    id UUID PRIMARY KEY,
    resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    section_type VARCHAR(30) NOT NULL CHECK (section_type IN ('SUMMARY','EDUCATION','SKILLS','EXPERIENCE','PROJECTS','CERTIFICATIONS','ACHIEVEMENTS','CONTACT','OTHER')),
    raw_text TEXT NOT NULL,
    normalized_text TEXT NOT NULL,
    sequence_order INTEGER NOT NULL CHECK (sequence_order >= 0),
    created_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT uq_resume_section_order UNIQUE (resume_id, sequence_order)
);

CREATE INDEX idx_resume_sections_resume ON resume_sections(resume_id, sequence_order);
