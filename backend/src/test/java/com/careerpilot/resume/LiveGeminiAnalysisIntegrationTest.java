package com.careerpilot.resume;

import com.careerpilot.modules.resume.analysis.entity.AnalysisStatus;
import com.careerpilot.modules.resume.analysis.repository.ResumeAnalysisRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@EnabledIfEnvironmentVariable(named="RUN_LIVE_GEMINI_TEST",matches="true")
class LiveGeminiAnalysisIntegrationTest {
 @Autowired MockMvc mvc;@Autowired ObjectMapper json;@Autowired ResumeAnalysisRepository analyses;
 @Test void runsRealCareerPilotAnalysisWithoutLoggingSensitiveInput()throws Exception{
  String email="live-gemini-"+System.currentTimeMillis()+"@example.invalid";
  String registration="{\"fullName\":\"Live Verification\",\"email\":\""+email+"\",\"password\":\"Password1\",\"confirmPassword\":\"Password1\"}";
  JsonNode tokens=json.readTree(mvc.perform(post("/api/v1/auth/register").contentType("application/json").content(registration)).andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());
  String auth="Bearer "+tokens.path("accessToken").asText();
  byte[] pdf=ResumeParsingTest.pdf("SUMMARY","Backend engineer","SKILLS","Java Spring PostgreSQL","EXPERIENCE","Built reliable APIs","PROJECTS","Developed a career application");
  JsonNode resume=json.readTree(mvc.perform(multipart("/api/v1/resumes").file(new MockMultipartFile("file","live-verification.pdf","application/pdf",pdf)).header("Authorization",auth)).andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());
  JsonNode result=json.readTree(mvc.perform(post("/api/v1/resumes/{id}/analyses",resume.path("id").asText()).header("Authorization",auth)).andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());
  assertThat(result.path("primaryModelAttempted").asText()).isEqualTo("gemini-3.6-flash");assertThat(result.path("atsScore").isInt()).isTrue();
  var saved=analyses.findById(java.util.UUID.fromString(result.path("id").asText())).orElseThrow();assertThat(saved.getPrimaryModelAttempted()).isEqualTo("gemini-3.6-flash");
  if(saved.getStatus()==AnalysisStatus.COMPLETED){assertThat(saved.getAiRequestOutcome()).isIn("PRIMARY_SUCCESS","FALLBACK_SUCCESS");assertThat(saved.getFindings()).anyMatch(f->f.getCategory().startsWith("AI_"));}else{assertThat(saved.getStatus()).isEqualTo(AnalysisStatus.PARTIAL);assertThat(saved.getAiRequestOutcome()).isEqualTo("FAILED");assertThat(saved.getFindings()).anyMatch(f->!f.getCategory().startsWith("AI_"));}
  System.out.printf("LIVE_GEMINI_RESULT status=%s primaryModel=%s fallbackModel=%s finalModel=%s outcome=%s%n",saved.getStatus(),saved.getPrimaryModelAttempted(),saved.getFallbackModelUsed()==null?"NONE":saved.getFallbackModelUsed(),saved.getModelName(),saved.getAiRequestOutcome());
 }
}
