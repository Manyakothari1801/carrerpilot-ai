CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE schema_metadata (
    id SMALLINT PRIMARY KEY,
    application_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT schema_metadata_single_row CHECK (id = 1)
);

INSERT INTO schema_metadata (id, application_name) VALUES (1, 'CareerPilot AI');
