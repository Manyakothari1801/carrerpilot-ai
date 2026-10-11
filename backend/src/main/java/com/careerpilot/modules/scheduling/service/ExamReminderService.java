package com.careerpilot.modules.scheduling.service;

import com.careerpilot.modules.notification.email.EmailService;
import com.careerpilot.modules.notification.email.ExamEmailDetails;
import com.careerpilot.modules.scheduling.entity.ScheduledExam;
import com.careerpilot.modules.scheduling.entity.ScheduledExamStatus;
import com.careerpilot.modules.scheduling.repository.ScheduledExamRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;

@Service
public class ExamReminderService {
    private static final Logger log = LoggerFactory.getLogger(ExamReminderService.class);
    private final ScheduledExamRepository exams;
    private final EmailService emailService;
    private final Duration leadTime;

    public ExamReminderService(ScheduledExamRepository exams, EmailService emailService,
                               @Value("${careerpilot.mail.reminder-lead-time:PT1H}") Duration leadTime) {
        this.exams = exams;
        this.emailService = emailService;
        this.leadTime = leadTime;
    }

    @Transactional
    public int sendDueReminders(Instant now) {
        int sent = 0;
        for (ScheduledExam exam : exams.lockDueReminders(ScheduledExamStatus.SCHEDULED, now, now.plus(leadTime))) {
            boolean delivered;
            try {
                delivered = emailService.sendExamReminder(details(exam));
            } catch (RuntimeException exception) {
                log.warn("Exam reminder delivery failed; scheduleId={} errorType={}", exam.getId(),
                        exception.getClass().getSimpleName());
                delivered = false;
            }
            if (delivered) {
                exam.setReminderSentAt(now);
                sent++;
            }
        }
        return sent;
    }

    private ExamEmailDetails details(ScheduledExam exam) {
        return new ExamEmailDetails(exam.getId(), exam.getOwner().getEmail(), exam.getOwner().getFullName(),
                exam.getAssessment().getTitle(), exam.getAssessment().getAssessmentType().name(),
                exam.getScheduledStart(), exam.getScheduledEnd(), exam.getAssessment().getDurationMinutes(),
                exam.getAssessment().getTotalQuestions());
    }
}
