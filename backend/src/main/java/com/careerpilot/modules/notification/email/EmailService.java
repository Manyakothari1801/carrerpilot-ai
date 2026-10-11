package com.careerpilot.modules.notification.email;

public interface EmailService {
    boolean sendExamScheduled(ExamEmailDetails details);
    boolean sendExamRescheduled(ExamEmailDetails details);
    boolean sendExamCancelled(ExamEmailDetails details);
    boolean sendExamReminder(ExamEmailDetails details);
}
