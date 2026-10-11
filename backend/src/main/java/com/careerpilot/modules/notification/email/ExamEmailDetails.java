package com.careerpilot.modules.notification.email;

import java.time.Instant;
import java.util.UUID;

public record ExamEmailDetails(
        UUID scheduledExamId,
        String recipientEmail,
        String studentName,
        String assessmentTitle,
        String assessmentCategory,
        Instant scheduledStart,
        Instant scheduledEnd,
        int durationMinutes,
        int questionCount
) {}
