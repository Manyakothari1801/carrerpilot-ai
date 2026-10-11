package com.careerpilot.modules.notification.email;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class ExamNotificationListener {
    private static final Logger log = LoggerFactory.getLogger(ExamNotificationListener.class);
    private final EmailService emailService;

    public ExamNotificationListener(EmailService emailService) { this.emailService = emailService; }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void send(ExamNotificationEvent event) {
        try {
            boolean sent = switch (event.type()) {
                case SCHEDULED -> emailService.sendExamScheduled(event.details());
                case RESCHEDULED -> emailService.sendExamRescheduled(event.details());
                case CANCELLED -> emailService.sendExamCancelled(event.details());
            };
            if (!sent) log.warn("Exam notification was not delivered; notificationType={} scheduleId={}",
                    event.type(), event.details().scheduledExamId());
        } catch (RuntimeException exception) {
            log.warn("Exam notification failed after transaction commit; notificationType={} scheduleId={} errorType={}",
                    event.type(), event.details().scheduledExamId(), exception.getClass().getSimpleName());
        }
    }
}
