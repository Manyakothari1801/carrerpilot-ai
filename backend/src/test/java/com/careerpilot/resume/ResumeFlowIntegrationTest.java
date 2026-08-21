package com.careerpilot.resume;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import java.io.ByteArrayOutputStream;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:resume;MODE=PostgreSQL;DB_CLOSE_DELAY=-1","spring.datasource.driver-class-name=org.h2.Driver","spring.datasource.username=sa","spring.datasource.password=","spring.jpa.hibernate.ddl-auto=create-drop","spring.flyway.enabled=false","careerpilot.resume.storage-path=./target/test-resume-storage","careerpilot.resume.max-file-size-mb=1"})
@AutoConfigureMockMvc @ActiveProfiles("test")
class ResumeFlowIntegrationTest {
    @Autowired MockMvc mvc;@Autowired ObjectMapper json;
    @Test void uploadDuplicateActivationOwnershipDownloadAndDeleteFlow() throws Exception {
        String owner=register("resume-owner@example.com"),other=register("resume-other@example.com");
        byte[] pdf=ResumeParsingTest.pdf("CONTACT","resume-owner@example.com","SUMMARY","Platform engineer","SKILLS","Java, PostgreSQL");
        JsonNode first=upload(owner,"resume.pdf","application/pdf",pdf);
        mvc.perform(get("/api/v1/resumes").header("Authorization",owner)).andExpect(status().isOk()).andExpect(jsonPath("$[0].active").value(true)).andExpect(jsonPath("$[0].parseStatus").value("PARSED"));
        JsonNode duplicate=upload(owner,"copy.pdf","application/pdf",pdf);org.assertj.core.api.Assertions.assertThat(duplicate.get("id").asText()).isEqualTo(first.get("id").asText());
        JsonNode second=upload(owner,"resume.docx","application/vnd.openxmlformats-officedocument.wordprocessingml.document",docx());
        mvc.perform(patch("/api/v1/resumes/{id}/active",second.get("id").asText()).header("Authorization",owner)).andExpect(status().isOk()).andExpect(jsonPath("$.active").value(true));
        mvc.perform(get("/api/v1/resumes/{id}",first.get("id").asText()).header("Authorization",other)).andExpect(status().isNotFound());
        mvc.perform(get("/api/v1/resumes/{id}/download",first.get("id").asText()).header("Authorization",owner)).andExpect(status().isOk()).andExpect(header().string("Content-Type","application/pdf"));
        mvc.perform(delete("/api/v1/resumes/{id}",second.get("id").asText()).header("Authorization",owner)).andExpect(status().isOk());
        mvc.perform(get("/api/v1/resumes/{id}",second.get("id").asText()).header("Authorization",owner)).andExpect(status().isNotFound());
        mvc.perform(get("/api/v1/resumes/{id}",first.get("id").asText()).header("Authorization",owner)).andExpect(status().isOk()).andExpect(jsonPath("$.active").value(true));
    }
    @Test void rejectsUnauthorizedUnsupportedAndOversizedFiles() throws Exception {
        mvc.perform(multipart("/api/v1/resumes").file(new MockMultipartFile("file","resume.pdf","application/pdf",ResumeParsingTest.pdf("SUMMARY","Text")))).andExpect(status().isUnauthorized());
        String auth=register("resume-validation@example.com");
        mvc.perform(multipart("/api/v1/resumes").file(new MockMultipartFile("file","resume.txt","text/plain","plain text".getBytes())).header("Authorization",auth)).andExpect(status().isUnsupportedMediaType());
        byte[] huge=new byte[1024*1024+1];huge[0]='%';huge[1]='P';huge[2]='D';huge[3]='F';huge[4]='-';
        mvc.perform(multipart("/api/v1/resumes").file(new MockMultipartFile("file","large.pdf","application/pdf",huge)).header("Authorization",auth)).andExpect(status().isPayloadTooLarge());
    }
    private JsonNode upload(String auth,String name,String mime,byte[] bytes)throws Exception{return json.readTree(mvc.perform(multipart("/api/v1/resumes").file(new MockMultipartFile("file",name,mime,bytes)).header("Authorization",auth)).andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());}
    private String register(String email)throws Exception{String body="{\"fullName\":\"Resume Test\",\"email\":\""+email+"\",\"password\":\"Password1\",\"confirmPassword\":\"Password1\"}";JsonNode response=json.readTree(mvc.perform(post("/api/v1/auth/register").contentType("application/json").content(body)).andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());return "Bearer "+response.get("accessToken").asText();}
    private byte[] docx()throws Exception{try(XWPFDocument doc=new XWPFDocument();ByteArrayOutputStream out=new ByteArrayOutputStream()){doc.createParagraph().createRun().setText("EXPERIENCE");doc.createParagraph().createRun().setText("Built deterministic systems");doc.write(out);return out.toByteArray();}}
}
