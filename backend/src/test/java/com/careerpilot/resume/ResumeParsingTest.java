package com.careerpilot.resume;

import com.careerpilot.modules.resume.parser.*;
import org.apache.pdfbox.pdmodel.*;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.junit.jupiter.api.Test;
import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import static org.assertj.core.api.Assertions.assertThat;

class ResumeParsingTest {
    static { try { Path cache=Path.of("target","pdfbox-font-cache").toAbsolutePath();Files.createDirectories(cache);System.setProperty("pdfbox.fontcache",cache.toString()); } catch (Exception ignored) { } }
    @Test void pdfExtractionPreservesDeterministicSections() throws Exception {
        String text=new PdfResumeTextExtractor().extract(pdf("SUMMARY","Backend engineer","SKILLS","Java Spring Boot"));
        var sections=new ResumeSectionParser().parse(text);
        assertThat(text).contains("Backend engineer","Java Spring Boot");
        assertThat(sections).extracting(ParsedSection::type).containsExactly(com.careerpilot.modules.resume.entity.SectionType.SUMMARY,com.careerpilot.modules.resume.entity.SectionType.SKILLS);
    }
    @Test void docxExtractionIncludesParagraphsAndTables() throws Exception {
        byte[] bytes;try(XWPFDocument doc=new XWPFDocument();ByteArrayOutputStream out=new ByteArrayOutputStream()){doc.createParagraph().createRun().setText("EDUCATION");doc.createParagraph().createRun().setText("Example University");var table=doc.createTable(1,2);table.getRow(0).getCell(0).setText("Degree");table.getRow(0).getCell(1).setText("B.Tech");doc.write(out);bytes=out.toByteArray();}
        String text=new DocxResumeTextExtractor().extract(bytes);assertThat(text).contains("Example University","Degree | B.Tech");
    }
    @Test void contactExtractionAvoidsGuessingMissingValues(){var value=new ContactExtractor().extract("student@example.com | +91 98765 43210 | linkedin.com/in/student | github.com/student");assertThat(value.email()).isEqualTo("student@example.com");assertThat(value.linkedin()).contains("linkedin.com/in/student");assertThat(value.github()).contains("github.com/student");}
    static byte[] pdf(String... lines) throws Exception {try(PDDocument doc=new PDDocument();ByteArrayOutputStream out=new ByteArrayOutputStream()){PDPage page=new PDPage(PDRectangle.A4);doc.addPage(page);try(var stream=new org.apache.pdfbox.pdmodel.PDPageContentStream(doc,page)){stream.beginText();stream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA),12);stream.newLineAtOffset(50,780);for(String line:lines){stream.showText(line);stream.newLineAtOffset(0,-18);}stream.endText();}doc.save(out);return out.toByteArray();}}
}
