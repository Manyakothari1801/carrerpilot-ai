package com.careerpilot.modules.notification.email;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class JavaMailEmailService implements EmailService {
    private static final Logger log = LoggerFactory.getLogger(JavaMailEmailService.class);
    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("dd MMMM uuuu", Locale.ENGLISH);
    private static final DateTimeFormatter TIME = DateTimeFormatter.ofPattern("hh:mm a", Locale.ENGLISH);
    private static final DateTimeFormatter ZONE = DateTimeFormatter.ofPattern("z", Locale.ENGLISH);
    private static final String INSTRUCTIONS = """
            <li>Use a laptop or desktop for the best experience.</li>
            <li>Ensure that you have a stable internet connection.</li>
            <li>Use a supported modern browser.</li>
            <li>Close unnecessary applications before starting.</li>
            <li>Do not refresh or close the assessment window unnecessarily.</li>
            <li>Complete the assessment within the allotted time.</li>
            <li>Start the assessment only when you are ready.</li>
            """;

    private final JavaMailSender mailSender;
    private final String username;
    private final String from;
    private final ZoneId timeZone;
    private final String startUrl;

    public JavaMailEmailService(JavaMailSender mailSender,
                                @Value("${spring.mail.username:}") String username,
                                @Value("${careerpilot.mail.from:}") String from,
                                @Value("${careerpilot.mail.time-zone:Asia/Kolkata}") String timeZone,
                                @Value("${careerpilot.mail.frontend-url:http://localhost:5173}") String frontendUrl) {
        this.mailSender = mailSender;
        this.username = username;
        this.from = from;
        this.timeZone = ZoneId.of(timeZone);
        this.startUrl = UriComponentsBuilder.fromUriString(frontendUrl).replacePath("/student/scheduled-exams")
                .replaceQuery(null).fragment(null).build().toUriString();
    }

    @Override public boolean sendExamScheduled(ExamEmailDetails d) {
        return send(d, "Assessment Scheduled – " + d.assessmentTitle() + " | Career Guidance AI",
                "Your assessment has been successfully scheduled on Career Guidance AI.", true, true, "SCHEDULED");
    }

    @Override public boolean sendExamRescheduled(ExamEmailDetails d) {
        return send(d, "Assessment Rescheduled – " + d.assessmentTitle() + " | Career Guidance AI",
                "Your assessment has been successfully rescheduled.", true, false, "RESCHEDULED");
    }

    @Override public boolean sendExamCancelled(ExamEmailDetails d) {
        return send(d, "Assessment Cancelled – " + d.assessmentTitle() + " | Career Guidance AI",
                "Your scheduled assessment has been cancelled successfully.", false, false, "CANCELLED");
    }

    @Override public boolean sendExamReminder(ExamEmailDetails d) {
        return send(d, "Reminder: Your " + d.assessmentTitle() + " Assessment Starts Soon",
                "This is a reminder that your scheduled assessment will begin soon.", true, false, "REMINDER");
    }

    private boolean send(ExamEmailDetails d, String subject, String introduction, boolean includeButton,
                         boolean includeCategory, String notificationType) {
        if (d.recipientEmail() == null || d.recipientEmail().isBlank()) {
            log.warn("Exam email skipped because the account email is missing; notificationType={} scheduleId={}", notificationType, d.scheduledExamId());
            return false;
        }
        if (username == null || username.isBlank() || from == null || from.isBlank()) {
            log.warn("Exam email skipped because MAIL_USERNAME or MAIL_FROM is not configured; notificationType={} scheduleId={}", notificationType, d.scheduledExamId());
            return false;
        }
        try {
            MimeMessage mime = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mime, true, StandardCharsets.UTF_8.name());
            helper.setFrom(from);
            helper.setTo(d.recipientEmail());
            helper.setSubject(subject);
            boolean cancellation = "CANCELLED".equals(notificationType);
            helper.setText(plainText(d, introduction, includeButton, includeCategory, cancellation),
                    html(d, introduction, includeButton, includeCategory, cancellation));
            mailSender.send(mime);
            return true;
        } catch (RuntimeException | jakarta.mail.MessagingException exception) {
            log.warn("Exam email delivery failed; notificationType={} scheduleId={} errorType={} message={}",
                    notificationType, d.scheduledExamId(), exception.getClass().getSimpleName(), sanitized(exception));
            return false;
        }
    }

    private String html(ExamEmailDetails d, String introduction, boolean includeButton, boolean includeCategory,
                        boolean cancellation) {
        String details = includeCategory ? categoryDetails(d) : scheduleDetails(d, cancellation);
        String button = includeButton ? "<div style=\"margin:28px 0;text-align:center\"><a href=\"" + escape(startUrl)
                + "\" style=\"display:inline-block;background:#0891b2;color:#ffffff;text-decoration:none;font-weight:700;padding:13px 28px;border-radius:8px\">Start Assessment</a></div>"
                : "";
        String instructions = includeButton ? "<h2 style=\"font-size:18px;margin:28px 0 10px;color:#0f172a\">General Instructions</h2>"
                + "<ul style=\"padding-left:22px;line-height:1.7;color:#334155\">" + INSTRUCTIONS + "</ul>" : "";
        return "<!doctype html><html><body style=\"margin:0;background:#f1f5f9;font-family:Arial,sans-serif;color:#0f172a\">"
                + "<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\"><tr><td align=\"center\" style=\"padding:24px 12px\">"
                + "<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:640px;background:#ffffff;border-radius:12px;overflow:hidden\">"
                + "<tr><td style=\"background:#0f172a;color:#ffffff;padding:24px 30px;font-size:22px;font-weight:700\">Career Guidance AI</td></tr>"
                + "<tr><td style=\"padding:30px\"><p style=\"font-size:16px\">Dear " + escape(displayName(d.studentName())) + ",</p>"
                + "<p style=\"line-height:1.6;color:#334155\">" + escape(introduction) + "</p>"
                + details + button + instructions
                + "<p style=\"margin-top:30px;line-height:1.6\">Warm Regards,<br><strong>Career Guidance AI Team</strong></p>"
                + "<p style=\"font-size:12px;color:#64748b;border-top:1px solid #e2e8f0;padding-top:18px\">Intelligent Career Guidance and Resume Optimization Platform Using AI</p>"
                + "</td></tr></table></td></tr></table></body></html>";
    }

    private String categoryDetails(ExamEmailDetails d) {
        return "<h2 style=\"font-size:18px;margin:28px 0 12px\">Assessment Details</h2>"
                + "<div style=\"border:1px solid #cbd5e1;border-radius:10px;padding:18px;background:#f8fafc;line-height:1.7\">"
                + row("Assessment Name", d.assessmentTitle()) + row("Number of Sections", "1")
                + "<h3 style=\"margin:16px 0 6px\">Section 1</h3>"
                + row("Name", readable(d.assessmentCategory())) + row("Time Limit", d.durationMinutes() + " min(s)")
                + row("Number of Questions", Integer.toString(d.questionCount())) + scheduleRows(d) + "</div>";
    }

    private String scheduleDetails(ExamEmailDetails d, boolean cancellation) {
        return "<h2 style=\"font-size:18px;margin:28px 0 12px\">Assessment Details</h2>"
                + "<div style=\"border:1px solid #cbd5e1;border-radius:10px;padding:18px;background:#f8fafc;line-height:1.7\">"
                + row("Assessment Name", d.assessmentTitle()) + scheduleRows(d, cancellation) + "</div>";
    }

    private String scheduleRows(ExamEmailDetails d) {
        return scheduleRows(d, false);
    }

    private String scheduleRows(ExamEmailDetails d, boolean cancellation) {
        String zone = format(ZONE, d.scheduledStart());
        return row(cancellation ? "Previously Scheduled Date" : "Scheduled Date", format(DATE, d.scheduledStart()))
                + row("Start Time", format(TIME, d.scheduledStart()) + " (" + zone + ")")
                + row("End Time", format(TIME, d.scheduledEnd()) + " (" + zone + ")")
                + row("Duration", d.durationMinutes() + " minutes");
    }

    private String row(String label, String value) { return "<div><strong>" + escape(label) + ":</strong> " + escape(value) + "</div>"; }
    private String format(DateTimeFormatter formatter, Instant value) { return formatter.withZone(timeZone).format(value); }
    private String readable(String value) { return value == null ? "Assessment" : value.replace('_', ' ').toLowerCase().replaceFirst("^.", value.substring(0, 1).toUpperCase()); }

    private String plainText(ExamEmailDetails d, String introduction, boolean includeButton, boolean includeCategory,
                             boolean cancellation) {
        StringBuilder text = new StringBuilder("Dear ").append(displayName(d.studentName())).append(",\n\n")
                .append(introduction).append("\n\nASSESSMENT DETAILS\nAssessment Name: ").append(d.assessmentTitle()).append('\n');
        if (includeCategory) text.append("Number of Sections: 1\nSection 1\nName: ").append(readable(d.assessmentCategory()))
                .append("\nTime Limit: ").append(d.durationMinutes()).append(" min(s)\nNumber of Questions: ").append(d.questionCount()).append('\n');
        text.append(cancellation ? "Previously Scheduled Date: " : "Scheduled Date: ")
                .append(format(DATE, d.scheduledStart())).append("\nStart Time: ").append(format(TIME, d.scheduledStart()))
                .append(" (").append(format(ZONE, d.scheduledStart())).append(")\nEnd Time: ")
                .append(format(TIME, d.scheduledEnd())).append(" (").append(format(ZONE, d.scheduledStart()))
                .append(")\nDuration: ").append(d.durationMinutes()).append(" minutes\n");
        if (includeButton) text.append("\nStart Assessment: ").append(startUrl).append("\n\nGeneral Instructions\n- Use a laptop or desktop for the best experience.\n- Ensure that you have a stable internet connection.\n- Use a supported modern browser.\n- Close unnecessary applications before starting.\n- Do not refresh or close the assessment window unnecessarily.\n- Complete the assessment within the allotted time.\n- Start the assessment only when you are ready.\n");
        return text.append("\nWarm Regards,\nCareer Guidance AI Team\n\nIntelligent Career Guidance and Resume Optimization Platform Using AI").toString();
    }

    private String displayName(String value) { return value == null || value.isBlank() ? "Student" : value; }
    private String sanitized(Exception e) { String m=e.getMessage(); if(m==null||m.isBlank())return "No provider message";String s=m.replaceAll("(?i)[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}","[email]").replaceAll("(?i)(password|pass|token|secret)\\s*[=:]\\s*\\S+","$1=[redacted]").replace('\r',' ').replace('\n',' ');return s.substring(0,Math.min(240,s.length())); }
    private String escape(String value) { return value==null?"":value.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;").replace("\"","&quot;").replace("'","&#39;"); }
}
