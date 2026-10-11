package com.careerpilot.careerai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:livecareerai;MODE=PostgreSQL;DB_CLOSE_DELAY=-1","spring.datasource.driver-class-name=org.h2.Driver","spring.datasource.username=sa","spring.datasource.password=","spring.jpa.hibernate.ddl-auto=create-drop","spring.flyway.enabled=false","careerpilot.ai.enabled=true"})
@AutoConfigureMockMvc @ActiveProfiles("test")
@EnabledIfEnvironmentVariable(named="RUN_LIVE_CAREER_AI_TEST",matches="(?i)true")
class LiveCareerAiIntegrationTest {
    @Autowired MockMvc mvc;@Autowired ObjectMapper json;

    @Test void interviewAndCopilotSucceedThroughRealControllerFlow()throws Exception{
        String auth=register();complete(auth);
        JsonNode first=json.readTree(mvc.perform(post("/api/v1/career-ai/interview").header("Authorization",auth).contentType("application/json").content("{\"targetCareer\":\"Backend Developer\",\"mode\":\"TECHNICAL\",\"focusArea\":\"Java\"}"))
          .andExpect(status().isOk()).andExpect(jsonPath("$.question").isNotEmpty()).andReturn().getResponse().getContentAsString());
        String followUpBody=json.writeValueAsString(java.util.Map.of("targetCareer","Backend Developer","mode","TECHNICAL","focusArea","Java","previousQuestion",first.path("question").asText(),"answer","A Java interface defines a contract that implementing classes provide."));
        mvc.perform(post("/api/v1/career-ai/interview").header("Authorization",auth).contentType("application/json").content(followUpBody))
          .andExpect(status().isOk()).andExpect(jsonPath("$.question").isNotEmpty()).andExpect(jsonPath("$.feedback.nextFocus").exists());
        JsonNode copilot=json.readTree(mvc.perform(post("/api/v1/career-ai/copilot").header("Authorization",auth).contentType("application/json").content("{\"question\":\"What should I focus on next based on my current evidence?\"}"))
          .andExpect(status().isOk()).andExpect(jsonPath("$.aiGuidance").isNotEmpty()).andExpect(jsonPath("$.currentEvidence['Saved skills']").exists()).andReturn().getResponse().getContentAsString());
        assertThat(copilot.path("currentEvidence").path("Latest resume ATS").asText()).isEqualTo("Unavailable");
    }
    private void complete(String auth)throws Exception{mvc.perform(patch("/api/v1/profile").header("Authorization",auth).contentType("application/json").content("{\"degree\":\"B.Tech Computer Science\",\"graduationYear\":2027,\"targetRole\":\"Backend Developer\",\"experienceLevel\":\"ENTRY_LEVEL\"}")).andExpect(status().isOk());mvc.perform(put("/api/v1/profile/skills").header("Authorization",auth).contentType("application/json").content("{\"skills\":[{\"displayName\":\"Java\",\"proficiencyLevel\":\"ADVANCED\"},{\"displayName\":\"Spring Boot\",\"proficiencyLevel\":\"INTERMEDIATE\"}]}")).andExpect(status().isOk());}
    private String register()throws Exception{JsonNode response=json.readTree(mvc.perform(post("/api/v1/auth/register").contentType("application/json").content("{\"fullName\":\"Live Career AI\",\"email\":\"live-career-ai@example.com\",\"password\":\"Password1\",\"confirmPassword\":\"Password1\"}")).andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());return"Bearer "+response.path("accessToken").asText();}
}
