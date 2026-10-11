package com.careerpilot.notification;

import com.careerpilot.modules.notification.email.ExamEmailDetails;
import com.careerpilot.modules.notification.email.JavaMailEmailService;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.MimeMultipart;
import jakarta.mail.Part;
import org.junit.jupiter.api.Test;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class JavaMailEmailServiceTest {
    private static final Instant START = Instant.parse("2026-09-20T04:30:00Z");
    private static final Instant END = Instant.parse("2026-09-20T04:50:00Z");

    @Test void scheduledEmailContainsProfessionalDynamicHtmlAndPlainFallback() throws Exception {
        Sent sent = send(Type.SCHEDULED);
        assertThat(sent.message().getSubject()).isEqualTo("Assessment Scheduled – Java Assessment | Career Guidance AI");
        assertThat(sent.html()).contains("Dear Manya Kothari", "Java Assessment", "20 September 2026",
                "10:00 AM (IST)", "10:20 AM (IST)", "Section 1", "Technical mcq", "10",
                "Start Assessment", "http://localhost:5173/student/scheduled-exams", "General Instructions");
        assertThat(sent.plain()).contains("Dear Manya Kothari", "Start Assessment:", "Number of Questions: 10");
        assertThat(sent.html()).doesNotContain("password", "App Password", "JWT", "secret");
    }

    @Test void rescheduleAndReminderUseExpectedSubjectsAndContent() throws Exception {
        Sent rescheduled = send(Type.RESCHEDULED);
        assertThat(rescheduled.message().getSubject()).isEqualTo("Assessment Rescheduled – Java Assessment | Career Guidance AI");
        assertThat(rescheduled.html()).contains("successfully rescheduled", "10:00 AM (IST)", "Start Assessment");
        Sent reminder = send(Type.REMINDER);
        assertThat(reminder.message().getSubject()).isEqualTo("Reminder: Your Java Assessment Assessment Starts Soon");
        assertThat(reminder.html()).contains("will begin soon", "Java Assessment", "Start Assessment");
    }

    @Test void cancellationContainsNoActiveStartLink() throws Exception {
        Sent sent = send(Type.CANCELLED);
        assertThat(sent.message().getSubject()).isEqualTo("Assessment Cancelled – Java Assessment | Career Guidance AI");
        assertThat(sent.html()).contains("cancelled successfully", "Java Assessment", "Previously Scheduled Date",
                        "20 September 2026", "10:00 AM (IST)")
                .doesNotContain("Start Assessment", "/student/scheduled-exams");
    }

    @Test void missingAccountEmailIsHandledWithoutContactingSmtp() {
        JavaMailSender sender = mock(JavaMailSender.class);
        JavaMailEmailService service = service(sender, "sender@gmail.com", "sender@gmail.com");
        ExamEmailDetails details = details(" ");
        assertThat(service.sendExamScheduled(details)).isFalse();
        verifyNoInteractions(sender);
    }

    @Test void missingMailCredentialsAreHandledWithoutContactingSmtp() {
        JavaMailSender sender = mock(JavaMailSender.class);
        JavaMailEmailService service = service(sender, "", "");
        assertThat(service.sendExamScheduled(details("student@example.com"))).isFalse();
        verifyNoInteractions(sender);
    }

    private Sent send(Type type) throws Exception {
        JavaMailSender sender = mock(JavaMailSender.class);
        MimeMessage message = new JavaMailSenderImpl().createMimeMessage();
        when(sender.createMimeMessage()).thenReturn(message);
        JavaMailEmailService service = service(sender, "sender@gmail.com", "sender@gmail.com");
        boolean result = switch (type) {
            case SCHEDULED -> service.sendExamScheduled(details("student@example.com"));
            case RESCHEDULED -> service.sendExamRescheduled(details("student@example.com"));
            case REMINDER -> service.sendExamReminder(details("student@example.com"));
            case CANCELLED -> service.sendExamCancelled(details("student@example.com"));
        };
        assertThat(result).isTrue();
        verify(sender).send(message);
        message.saveChanges();
        return new Sent(message, textPart(message, "text/plain"), textPart(message, "text/html"));
    }

    private JavaMailEmailService service(JavaMailSender sender, String username, String from) {
        return new JavaMailEmailService(sender, username, from, "Asia/Kolkata", "http://localhost:5173/");
    }

    private String textPart(Part part, String mimeType) throws Exception {
        if (part.isMimeType(mimeType)) return part.getContent().toString();
        if (part.isMimeType("multipart/*")) {
            MimeMultipart multipart = (MimeMultipart) part.getContent();
            for (int i = 0; i < multipart.getCount(); i++) {
                String found = textPart(multipart.getBodyPart(i), mimeType);
                if (found != null) return found;
            }
        }
        return null;
    }

    private ExamEmailDetails details(String recipient) {
        return new ExamEmailDetails(UUID.randomUUID(), recipient, "Manya Kothari", "Java Assessment",
                "TECHNICAL_MCQ", START, END, 20, 10);
    }

    private enum Type { SCHEDULED, RESCHEDULED, REMINDER, CANCELLED }
    private record Sent(MimeMessage message, String plain, String html) {}
}
