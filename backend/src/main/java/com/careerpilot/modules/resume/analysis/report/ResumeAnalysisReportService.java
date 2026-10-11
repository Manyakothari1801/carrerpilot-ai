package com.careerpilot.modules.resume.analysis.report;

import com.careerpilot.exception.NotFoundException;
import com.careerpilot.modules.auth.entity.User;
import com.careerpilot.modules.resume.analysis.entity.AnalysisFinding;
import com.careerpilot.modules.resume.analysis.entity.ResumeAnalysis;
import com.careerpilot.modules.resume.analysis.mapper.AnalysisMapper;
import com.careerpilot.modules.resume.analysis.repository.ResumeAnalysisRepository;
import com.careerpilot.modules.resume.repository.ResumeRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.graphics.state.RenderingMode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class ResumeAnalysisReportService {
    private static final Color VIOLET = new Color(109, 40, 217);
    private static final Color INK = new Color(30, 27, 46);
    private static final Color MUTED = new Color(92, 85, 110);
    private static final Color PALE = new Color(243, 239, 252);
    private static final float LEFT = 54, RIGHT = 54, TOP = 58, BOTTOM = 54;
    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("dd MMM uuuu, HH:mm z", Locale.ENGLISH).withZone(ZoneId.systemDefault());
    private final ResumeRepository resumes;
    private final ResumeAnalysisRepository analyses;

    public ResumeAnalysisReportService(ResumeRepository resumes, ResumeAnalysisRepository analyses) {
        this.resumes = resumes;
        this.analyses = analyses;
    }

    @Transactional(readOnly = true)
    public ResumeAnalysisReport generate(User user, UUID resumeId, UUID analysisId) {
        var resume = resumes.findByIdAndUserId(resumeId, user.getId()).orElseThrow(() -> new NotFoundException("Resume not found"));
        var analysis = analyses.findByIdAndResumeId(analysisId, resumeId).orElseThrow(() -> new NotFoundException("Resume analysis not found"));
        try (var document = new PDDocument(); var output = new ByteArrayOutputStream()) {
            var writer = new Writer(document);
            writer.heading("Career Guidance AI", "Resume Intelligence Report");
            writer.info("Candidate", user.getFullName());
            writer.info("Email", user.getEmail());
            writer.info("Resume", resume.getOriginalFilename());
            writer.info("Analysis date", DATE.format(analysis.getCreatedAt()));
            writer.space(10);
            writer.score("ATS Score", analysis.getAtsScore());
            writer.score("Overall Resume Score", analysis.getOverallScore());
            writer.section("Score Breakdown");
            writer.metric("Sections", analysis.getSectionScore());
            writer.metric("Keywords", analysis.getKeywordScore());
            writer.metric("Action Verbs", analysis.getActionVerbScore());
            writer.metric("Quantification", analysis.getQuantificationScore());
            writer.metric("Readability", analysis.getReadabilityScore());
            writer.findings("Explainable ATS Findings", analysis.getFindings().stream().filter(f -> !isAi(f)).toList());
            writer.section("AI Resume Coach");
            var ai = analysis.getFindings().stream().filter(ResumeAnalysisReportService::isAi).toList();
            if (ai.isEmpty()) writer.paragraph(analysis.getAiMessage() == null || analysis.getAiMessage().isBlank() ? "AI feedback was disabled or unavailable for this analysis." : analysis.getAiMessage());
            else {
                if (analysis.getAiMessage() != null) writer.paragraph(analysis.getAiMessage());
                writer.findingItems(ai);
            }
            writer.section("Methodology and Disclaimer");
            writer.paragraph(AnalysisMapper.DISCLAIMER);
            writer.paragraph("AI feedback is advisory writing assistance. It may be unavailable and never changes the deterministic ATS score.");
            writer.finish();
            document.save(output);
            String base = resume.getOriginalFilename().replaceFirst("(?i)\\.(pdf|docx)$", "").replaceAll("[^a-zA-Z0-9._-]+", "-").replaceAll("-+", "-");
            if (base.isBlank()) base = "resume";
            return new ResumeAnalysisReport(output.toByteArray(), base + "-analysis-report.pdf");
        } catch (IOException exception) {
            throw new IllegalStateException("Resume analysis report could not be generated", exception);
        }
    }

    private static boolean isAi(AnalysisFinding finding) { return finding.getCategory().startsWith("AI_"); }

    private static final class Writer {
        private final PDDocument document;
        private final PDType1Font regular = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
        private final PDType1Font bold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
        private PDPage page;
        private PDPageContentStream stream;
        private float y;

        private Writer(PDDocument document) throws IOException { this.document = document; newPage(); }
        private void newPage() throws IOException {
            closeStream(); page = new PDPage(PDRectangle.A4); document.addPage(page); stream = new PDPageContentStream(document, page); y = page.getMediaBox().getHeight() - TOP;
            stream.setNonStrokingColor(VIOLET); stream.addRect(0, page.getMediaBox().getHeight() - 9, page.getMediaBox().getWidth(), 9); stream.fill();
        }
        private void ensure(float height) throws IOException { if (y - height < BOTTOM) newPage(); }
        private void heading(String brand, String title) throws IOException { text(brand, bold, 11, VIOLET); space(6); text(title, bold, 25, INK); space(16); }
        private void info(String label, String value) throws IOException { if (value != null && !value.isBlank()) line(label + ":", value, 10); }
        private void score(String label, int score) throws IOException { ensure(56); stream.setNonStrokingColor(PALE); stream.addRect(LEFT, y - 44, page.getMediaBox().getWidth() - LEFT - RIGHT, 48); stream.fill(); textAt(label, LEFT + 12, y - 14, bold, 10, MUTED); textAt(score + "/100", page.getMediaBox().getWidth() - RIGHT - 68, y - 20, bold, 18, VIOLET); y -= 58; }
        private void section(String title) throws IOException { ensure(36); space(10); text(title, bold, 16, INK); rule(); space(8); }
        private void metric(String name, int value) throws IOException { ensure(30); textAt(name, LEFT, y, regular, 10, INK); textAt(value + "%", page.getMediaBox().getWidth() - RIGHT - 28, y, bold, 10, VIOLET); y -= 8; float width = page.getMediaBox().getWidth() - LEFT - RIGHT; stream.setNonStrokingColor(new Color(225, 220, 234)); stream.addRect(LEFT, y, width, 5); stream.fill(); stream.setNonStrokingColor(VIOLET); stream.addRect(LEFT, y, width * Math.max(0, Math.min(100, value)) / 100f, 5); stream.fill(); y -= 17; }
        private void findings(String title, List<AnalysisFinding> values) throws IOException { section(title); if (values.isEmpty()) paragraph("No findings were stored for this analysis."); else findingItems(values); }
        private void findingItems(List<AnalysisFinding> values) throws IOException { for (var finding : values) { ensure(66); text(finding.getSeverity() + "  |  " + finding.getCategory(), bold, 9, VIOLET); text(finding.getTitle(), bold, 11, INK); paragraph(finding.getDescription()); if (finding.getOriginalText() != null && !finding.getOriginalText().isBlank()) labeled("Original", finding.getOriginalText()); if (finding.getSuggestedText() != null && !finding.getSuggestedText().isBlank()) labeled("Suggested", finding.getSuggestedText()); space(7); } }
        private void labeled(String label, String value) throws IOException { text(label, bold, 9, MUTED); paragraph(value); }
        private void paragraph(String value) throws IOException { for (String line : wrap(value == null ? "" : value, regular, 10, page.getMediaBox().getWidth() - LEFT - RIGHT)) text(line, regular, 10, MUTED); space(4); }
        private void line(String label, String value, float size) throws IOException { ensure(16); textAt(label, LEFT, y, bold, size, MUTED); textAt(value, LEFT + 86, y, regular, size, INK); y -= 15; }
        private void text(String value, PDType1Font font, float size, Color color) throws IOException { ensure(size + 7); textAt(value, LEFT, y, font, size, color); y -= size + 5; }
        private void textAt(String value, float x, float baseline, PDType1Font font, float size, Color color) throws IOException { stream.beginText(); stream.setRenderingMode(RenderingMode.FILL); stream.setFont(font, size); stream.setNonStrokingColor(color); stream.newLineAtOffset(x, baseline); stream.showText(clean(value)); stream.endText(); }
        private void rule() throws IOException { y -= 5; stream.setStrokingColor(new Color(221, 215, 234)); stream.moveTo(LEFT, y); stream.lineTo(page.getMediaBox().getWidth() - RIGHT, y); stream.stroke(); y -= 4; }
        private void space(float value) { y -= value; }
        private List<String> wrap(String value, PDType1Font font, float size, float maxWidth) throws IOException { var lines = new ArrayList<String>(); for (String paragraph : clean(value).split("\\R", -1)) { StringBuilder line = new StringBuilder(); for (String word : paragraph.split("\\s+")) { String candidate = line.isEmpty() ? word : line + " " + word; if (!line.isEmpty() && font.getStringWidth(candidate) / 1000 * size > maxWidth) { lines.add(line.toString()); line = new StringBuilder(word); } else line = new StringBuilder(candidate); } lines.add(line.toString()); } return lines; }
        private String clean(String value) { return value.replace('\u2022', '-').replace('\u2013', '-').replace('\u2014', '-').replace('\u2018', '\'').replace('\u2019', '\'').replace('\u201c', '"').replace('\u201d', '"').replaceAll("[^\\x20-\\x7E]", "?"); }
        private void finish() throws IOException { closeStream(); int total = document.getNumberOfPages(); for (int i = 0; i < total; i++) { var p = document.getPage(i); try (var footer = new PDPageContentStream(document, p, PDPageContentStream.AppendMode.APPEND, true)) { footer.beginText(); footer.setFont(regular, 8); footer.setNonStrokingColor(MUTED); footer.newLineAtOffset(LEFT, 28); footer.showText("Career Guidance AI  |  Resume Intelligence Report"); footer.endText(); footer.beginText(); footer.setFont(regular, 8); footer.setNonStrokingColor(MUTED); footer.newLineAtOffset(p.getMediaBox().getWidth() - RIGHT - 45, 28); footer.showText("Page " + (i + 1) + " of " + total); footer.endText(); } } }
        private void closeStream() throws IOException { if (stream != null) { stream.close(); stream = null; } }
    }
}
