package com.careerpilot.modules.interview.report;

import com.careerpilot.modules.auth.entity.User;
import com.careerpilot.modules.interview.service.InterviewSessionService;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class InterviewReportService {
    private final InterviewSessionService sessions;
    public InterviewReportService(InterviewSessionService sessions) { this.sessions = sessions; }

    public InterviewReport generate(User user, UUID id) {
        var session = sessions.get(user, id);
        try (var document = new PDDocument(); var output = new ByteArrayOutputStream()) {
            var regular = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
            var bold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
            var lines = new ArrayList<String>();
            lines.add("Career Guidance AI"); lines.add("AI Mock Interview Report"); lines.add("");
            lines.add("Candidate: " + user.getFullName()); lines.add("Target career: " + session.targetCareer());
            lines.add("Interview type / mode: " + session.interviewType() + " / " + session.mode());
            lines.add("Date: " + DateTimeFormatter.ofPattern("dd MMM uuuu HH:mm").withZone(ZoneId.systemDefault()).format(session.startedAt()));
            lines.add("Questions completed: " + session.completedAnswers() + " / " + session.questionCount());
            lines.add("Overall coaching score: " + (session.overallCoachingScore() == null ? "In progress" : session.overallCoachingScore() + " / 100"));
            for (var answer : session.answers()) {
                lines.add(""); lines.add("Question " + answer.sequenceNumber() + ": " + answer.question());
                lines.add("Transcript: " + answer.transcript());
                lines.add("Scores: technical " + answer.scores().technicalCorrectness() + ", relevance " + answer.scores().relevance() + ", structure " + answer.scores().answerStructure() + ", completeness " + answer.scores().completeness() + ", clarity " + answer.scores().communicationClarity());
                lines.add("Strengths: " + String.join("; ", answer.strengths()));
                lines.add("Areas to improve: " + String.join("; ", answer.needsImprovement()));
                lines.add("Topics to review: " + String.join("; ", answer.topicsToReview()));
                if (answer.suggestedAnswer() != null && !answer.suggestedAnswer().isBlank()) lines.add("Suggested stronger answer: " + answer.suggestedAnswer());
            }
            lines.add(""); lines.add(InterviewSessionService.DISCLAIMER);
            PDPage page = null; PDPageContentStream stream = null; float y = 0;
            for (String logical : lines) for (String line : wrap(clean(logical), 95)) {
                if (page == null || y < 58) { if (stream != null) stream.close(); page = new PDPage(PDRectangle.A4); document.addPage(page); stream = new PDPageContentStream(document, page); y = 790; }
                stream.beginText(); stream.setFont(line.startsWith("Career Guidance") || line.startsWith("AI Mock") ? bold : regular, line.startsWith("AI Mock") ? 18 : 10); stream.newLineAtOffset(52, y); stream.showText(line); stream.endText(); y -= line.isBlank() ? 10 : 15;
            }
            if (stream != null) stream.close(); document.save(output);
            return new InterviewReport(output.toByteArray(), "ai-interview-report-" + id + ".pdf");
        } catch (IOException e) { throw new IllegalStateException("Interview report could not be generated", e); }
    }
    private List<String> wrap(String value, int max) { if (value.isBlank()) return List.of(""); var result = new ArrayList<String>(); var line = new StringBuilder(); for (String word : value.split("\\s+")) { if (!line.isEmpty() && line.length() + word.length() + 1 > max) { result.add(line.toString()); line = new StringBuilder(); } if (!line.isEmpty()) line.append(' '); line.append(word); } result.add(line.toString()); return result; }
    private String clean(String value) { return value.replaceAll("[^\\x20-\\x7E]", "?"); }
}
