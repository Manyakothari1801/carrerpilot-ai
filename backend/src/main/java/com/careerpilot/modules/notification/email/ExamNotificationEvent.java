package com.careerpilot.modules.notification.email;

public record ExamNotificationEvent(Type type, ExamEmailDetails details) {
    public enum Type { SCHEDULED, RESCHEDULED, CANCELLED }
}
