package com.careerpilot.resume;

import com.careerpilot.modules.resume.analysis.ai.*;
import com.careerpilot.modules.resume.entity.ParseStatus;
import com.careerpilot.modules.resume.repository.ResumeRepository;
import com.fasterxml.jackson.databind.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:analysis;MODE=PostgreSQL;DB_CLOSE_DELAY=-1","spring.datasource.driver-class-name=org.h2.Driver","spring.datasource.username=sa","spring.datasource.password=","spring.jpa.hibernate.ddl-auto=create-drop","spring.flyway.enabled=false","careerpilot.resume.storage-path=./target/test-analysis-storage"})
@AutoConfigureMockMvc @ActiveProfiles("test")
class AnalysisFlowIntegrationTest {
 @Autowired MockMvc mvc;@Autowired ObjectMapper json;@Autowired ResumeRepository resumes;@MockitoBean ResumeAiFeedbackService ai;
 @BeforeEach void disabled(){when(ai.analyze(anyString())).thenReturn(AiFeedbackResult.disabled());}
 @Test void createsLocalAnalysisPreservesHistoryAndEnforcesOwnership() throws Exception {String owner=register("analysis-owner@example.com"),other=register("analysis-other@example.com");JsonNode resume=upload(owner,"analysis.pdf",ResumeParsingTest.pdf("CONTACT","analysis-owner@example.com | +1 555 123 4567","SUMMARY","Backend engineer","EDUCATION","B.Tech","SKILLS","Java Spring PostgreSQL Docker","EXPERIENCE","Built APIs serving 10000 users","PROJECTS","Developed CareerPilot"));String id=resume.get("id").asText();JsonNode local=json.readTree(create(owner,id).andExpect(jsonPath("$.status").value("COMPLETED")).andExpect(jsonPath("$.modelProvider").value("DISABLED")).andExpect(jsonPath("$.sectionScore").value(100)).andReturn().getResponse().getContentAsString());
  mvc.perform(post("/api/v1/resumes/{id}/analyses",id).header("Authorization",other)).andExpect(status().isNotFound());
  var feedback=new AiFeedback(java.util.List.of(new AiFeedback.Insight("Quantified impact","Uses a factual user count")),java.util.List.of(new AiFeedback.Weakness("Generic summary","Summary could be more specific",AiFeedback.Severity.MEDIUM)),java.util.List.of(),java.util.List.of(new AiFeedback.TextSuggestion("Built APIs serving 10000 users","Built resilient APIs serving 10000 users","Improves clarity without inventing experience")),java.util.List.of("Name the target backend role"));
  when(ai.analyze(anyString())).thenReturn(AiFeedbackResult.success(feedback,"mock-gemini"));
  JsonNode withAi=json.readTree(create(owner,id).andExpect(jsonPath("$.status").value("COMPLETED")).andExpect(jsonPath("$.modelProvider").value("GEMINI")).andExpect(jsonPath("$.aiMessage").value("Gemini feedback generated successfully.")).andExpect(jsonPath("$.findings[?(@.aiGenerated == true)]").isNotEmpty()).andReturn().getResponse().getContentAsString());
  org.assertj.core.api.Assertions.assertThat(withAi.get("overallScore").asInt()).isEqualTo(local.get("overallScore").asInt());org.assertj.core.api.Assertions.assertThat(withAi.get("atsScore").asInt()).isEqualTo(local.get("atsScore").asInt());
  mvc.perform(get("/api/v1/resumes/{id}/analyses",id).header("Authorization",owner)).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(2));mvc.perform(get("/api/v1/resume-analyses/latest-active").header("Authorization",owner)).andExpect(status().isOk()).andExpect(jsonPath("$.resumeId").value(id));}
 @Test void aiFailureProducesPartialAndUnparsedResumeIsRejected() throws Exception {String auth=register("analysis-partial@example.com");JsonNode resume=upload(auth,"partial.pdf",ResumeParsingTest.pdf("SKILLS","Java Spring","EXPERIENCE","Worked on services"));String id=resume.get("id").asText();when(ai.analyze(anyString())).thenReturn(AiFeedbackResult.failed("fake-gemini","Malformed mock response"));create(auth,id).andExpect(jsonPath("$.status").value("PARTIAL")).andExpect(jsonPath("$.overallScore").isNumber());var entity=resumes.findById(java.util.UUID.fromString(id)).orElseThrow();entity.setParseStatus(ParseStatus.FAILED);resumes.saveAndFlush(entity);mvc.perform(post("/api/v1/resumes/{id}/analyses",id).header("Authorization",auth)).andExpect(status().isConflict());}
 private org.springframework.test.web.servlet.ResultActions create(String auth,String id)throws Exception{return mvc.perform(post("/api/v1/resumes/{id}/analyses",id).header("Authorization",auth)).andExpect(status().isCreated()).andExpect(jsonPath("$.atsScore").isNumber()).andExpect(jsonPath("$.scoreDisclaimer").exists());}
 private JsonNode upload(String auth,String name,byte[] bytes)throws Exception{return json.readTree(mvc.perform(multipart("/api/v1/resumes").file(new MockMultipartFile("file",name,"application/pdf",bytes)).header("Authorization",auth)).andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());}
 private String register(String email)throws Exception{String body="{\"fullName\":\"Analysis Test\",\"email\":\""+email+"\",\"password\":\"Password1\",\"confirmPassword\":\"Password1\"}";JsonNode response=json.readTree(mvc.perform(post("/api/v1/auth/register").contentType("application/json").content(body)).andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());return "Bearer "+response.get("accessToken").asText();}
}
