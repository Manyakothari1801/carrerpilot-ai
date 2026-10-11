package com.careerpilot.modules.scheduling.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
public class ExamReminderScheduler {
    private final ExamReminderService reminderService;

    public ExamReminderScheduler(ExamReminderService reminderService) { this.reminderService = reminderService; }

    @Scheduled(cron = "${careerpilot.mail.reminder-cron:0 */5 * * * *}")
    public void sendUpcomingExamReminders() { reminderService.sendDueReminders(Instant.now()); }
}
