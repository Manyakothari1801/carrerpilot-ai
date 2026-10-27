package com.careerpilot.notification;

import com.careerpilot.modules.notification.email.ExamEmailDetails;
import com.careerpilot.modules.notification.email.JavaMailEmailService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class JavaMailEmailServiceTest {
    private static final Instant START = Instant.parse("2026-09-20T04:30:00Z");
    private static final Instant END = Instant.parse("2026-09-20T04:50:00Z");
    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void scheduledEmailContainsProfessionalDynamicHtmlAndPlainFallback() throws Exception {
        Sent sent = send(Type.SCHEDULED);
        assertThat(sent.subject()).isEqualTo("Assessment Scheduled – Java Assessment | Career Guidance AI");
        assertThat(sent.html()).contains("Dear Manya Kothari", "Java Assessment", "20 September 2026",
                "10:00 AM (IST)", "10:20 AM (IST)", "Section 1", "Technical mcq", "10",
                "Start Assessment", "http://localhost:5173/student/scheduled-exams", "General Instructions");
        assertThat(sent.plain()).contains("Dear Manya Kothari", "Start Assessment:", "Number of Questions: 10");
        assertThat(sent.html()).doesNotContain("App Password", "JWT", "secret");
    }

    @Test
    void rescheduleAndReminderUseExpectedSubjectsAndContent() throws Exception {
        Sent rescheduled = send(Type.RESCHEDULED);
        assertThat(rescheduled.subject()).isEqualTo("Assessment Rescheduled – Java Assessment | Career Guidance AI");
        assertThat(rescheduled.html()).contains("successfully rescheduled", "10:00 AM (IST)", "Start Assessment");

        Sent reminder = send(Type.REMINDER);
        assertThat(reminder.subject()).isEqualTo("Reminder: Your Java Assessment Assessment Starts Soon");
        assertThat(reminder.html()).contains("will begin soon", "Java Assessment", "Start Assessment");
    }

    @Test
    void cancellationContainsNoActiveStartLink() throws Exception {
        Sent sent = send(Type.CANCELLED);
        assertThat(sent.subject()).isEqualTo("Assessment Cancelled – Java Assessment | Career Guidance AI");
        assertThat(sent.html()).contains("cancelled successfully", "Java Assessment", "Previously Scheduled Date",
                        "20 September 2026", "10:00 AM (IST)")
                .doesNotContain("Start Assessment", "/student/scheduled-exams");
    }

    @Test
    void missingAccountEmailIsHandledWithoutHttpRequest() throws Exception {
        HttpClient client = mock(HttpClient.class);
        JavaMailEmailService service = service(client, "test_resend_key", "onboarding@resend.dev");
        assertThat(service.sendExamScheduled(details(" "))).isFalse();
        verifyNoInteractions(client);
    }

    @Test
    void missingResendApiKeyIsHandledWithoutHttpRequest() throws Exception {
        HttpClient client = mock(HttpClient.class);
        JavaMailEmailService service = service(client, "", "onboarding@resend.dev");
        assertThat(service.sendExamScheduled(details("student@example.com"))).isFalse();
        verifyNoInteractions(client);
    }

    @Test
    void missingSenderIsHandledWithoutHttpRequest() throws Exception {
        HttpClient client = mock(HttpClient.class);
        JavaMailEmailService service = service(client, "test_resend_key", "");
        assertThat(service.sendExamScheduled(details("student@example.com"))).isFalse();
        verifyNoInteractions(client);
    }

    @Test
    void resendHttpFailureReturnsFalse() throws Exception {
        HttpClient client = mock(HttpClient.class);
        @SuppressWarnings("unchecked")
        HttpResponse<String> response = mock(HttpResponse.class);
        when(response.statusCode()).thenReturn(403);
        when(client.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class))).thenReturn(response);
        JavaMailEmailService service = service(client, "test_resend_key", "onboarding@resend.dev");
        assertThat(service.sendExamScheduled(details("student@example.com"))).isFalse();
        verify(client).send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class));
    }

    private Sent send(Type type) throws Exception {
        HttpClient client = mock(HttpClient.class);
        @SuppressWarnings("unchecked")
        HttpResponse<String> response = mock(HttpResponse.class);
        when(response.statusCode()).thenReturn(200);
        when(client.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class))).thenReturn(response);
        JavaMailEmailService service = service(client, "test_resend_key", "onboarding@resend.dev");

        boolean success = switch (type) {
            case SCHEDULED -> service.sendExamScheduled(details("student@example.com"));
            case RESCHEDULED -> service.sendExamRescheduled(details("student@example.com"));
            case REMINDER -> service.sendExamReminder(details("student@example.com"));
            case CANCELLED -> service.sendExamCancelled(details("student@example.com"));
        };
        assertThat(success).isTrue();

        var captor = org.mockito.ArgumentCaptor.forClass(HttpRequest.class);
        verify(client).send(captor.capture(), any(HttpResponse.BodyHandler.class));
        HttpRequest request = captor.getValue();
        assertThat(request.uri().toString()).isEqualTo("https://api.resend.com/emails");
        assertThat(request.method()).isEqualTo("POST");
        assertThat(request.headers().firstValue("Authorization")).contains("Bearer test_resend_key");
        assertThat(request.headers().firstValue("Content-Type")).contains("application/json");

        HttpRequest.BodyPublisher publisher = request.bodyPublisher().orElseThrow();
        java.io.ByteArrayOutputStream bytes = new java.io.ByteArrayOutputStream();
        java.util.concurrent.CompletableFuture<Void> done = new java.util.concurrent.CompletableFuture<>();
        publisher.subscribe(new java.util.concurrent.Flow.Subscriber<>() {
            public void onSubscribe(java.util.concurrent.Flow.Subscription subscription) { subscription.request(Long.MAX_VALUE); }
            public void onNext(java.nio.ByteBuffer buffer) {
                byte[] chunk = new byte[buffer.remaining()];
                buffer.get(chunk);
                bytes.write(chunk, 0, chunk.length);
            }
            public void onError(Throwable error) { done.completeExceptionally(error); }
            public void onComplete() { done.complete(null); }
        });
        done.join();
        JsonNode json = mapper.readTree(bytes.toByteArray());
        assertThat(json.path("from").asText()).isEqualTo("onboarding@resend.dev");
        assertThat(json.path("to").get(0).asText()).isEqualTo("student@example.com");
        return new Sent(json.path("subject").asText(), json.path("text").asText(), json.path("html").asText());
    }

    private JavaMailEmailService service(HttpClient client, String apiKey, String from) {
        JavaMailEmailService service = new JavaMailEmailService(
                mapper, apiKey, from, "Asia/Kolkata", "http://localhost:5173/");
        ReflectionTestUtils.setField(service, "httpClient", client);
        return service;
    }

    private ExamEmailDetails details(String recipient) {
        return new ExamEmailDetails(UUID.randomUUID(), recipient, "Manya Kothari", "Java Assessment",
                "TECHNICAL_MCQ", START, END, 20, 10);
    }

    private enum Type { SCHEDULED, RESCHEDULED, REMINDER, CANCELLED }
    private record Sent(String subject, String plain, String html) {}
}
