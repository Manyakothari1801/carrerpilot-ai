ALTER TABLE scheduled_exams
    ADD COLUMN reminder_sent_at TIMESTAMPTZ;

CREATE INDEX idx_scheduled_exams_reminder_due
    ON scheduled_exams (scheduled_start)
    WHERE status = 'SCHEDULED'
      AND owner_user_id IS NOT NULL
      AND reminder_sent_at IS NULL;
