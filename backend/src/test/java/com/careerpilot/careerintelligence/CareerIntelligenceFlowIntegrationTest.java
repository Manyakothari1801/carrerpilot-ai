package com.careerpilot.careerintelligence;

import com.careerpilot.exception.ApiException;
import com.careerpilot.modules.careerrecommendation.client.CareerPredictionClient;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:careerintelligence;MODE=PostgreSQL;DB_CLOSE_DELAY=-1","spring.datasource.driver-class-name=org.h2.Driver","spring.datasource.username=sa","spring.datasource.password=","spring.jpa.hibernate.ddl-auto=create-drop","spring.flyway.enabled=false"})
@AutoConfigureMockMvc @ActiveProfiles("test")
class CareerIntelligenceFlowIntegrationTest {
    @Autowired MockMvc mvc; @Autowired ObjectMapper json; @Autowired JdbcTemplate jdbc;
    @MockitoBean CareerPredictionClient client;

    @Test void exposesGroundedExplanationAndDoesNotPersistHypotheticalSimulation() throws Exception {
        String auth=register("twin-owner@example.com");complete(auth);
        when(client.explain(any())).thenReturn(new CareerPredictionClient.ExplainResponse("model-v1","schema-v1","Not an employment prediction",List.of(new CareerPredictionClient.ExplainedPredictionItem("Backend Developer",.42,List.of("Profile skill: Java"),List.of(new CareerPredictionClient.FeatureContribution("Skill: java",.5)),List.of()))));
        when(client.simulate(any())).thenReturn(new CareerPredictionClient.SimulationResponse("model-v1","schema-v1",List.of(item(.42)),List.of(item(.48)),List.of(new CareerPredictionClient.SkillInput("PostgreSQL","INTERMEDIATE")),"Simulation only"));
        int skillCount=jdbc.queryForObject("select count(*) from user_skills",Integer.class);
        mvc.perform(get("/api/v1/career-intelligence/explanation").header("Authorization",auth)).andExpect(status().isOk()).andExpect(jsonPath("$.recommendations[0].supportingSignals[0].contribution").value(.5));
        mvc.perform(post("/api/v1/career-intelligence/simulate").header("Authorization",auth).contentType("application/json").content("{\"hypotheticalSkills\":[{\"name\":\"PostgreSQL\",\"proficiency\":\"INTERMEDIATE\"}]}"))
          .andExpect(status().isOk()).andExpect(jsonPath("$.simulated[0].confidence").value(.48));
        assertThat(jdbc.queryForObject("select count(*) from user_skills",Integer.class)).isEqualTo(skillCount);
        verify(client).simulate(argThat(request->request.skills().size()==3&&request.hypotheticalSkills().size()==1));
    }

    @Test void counterfactualIsAuthenticatedValidatedAndNonPersistent() throws Exception {
        String auth=register("path-owner@example.com");complete(auth);
        when(client.counterfactual(any())).thenReturn(new CareerPredictionClient.CounterfactualResponse("model-v1","schema-v1","Data Analyst",true,4,2,.12,.24,.12,2,List.of(new CareerPredictionClient.SkillInput("SQL","INTERMEDIATE")),"Simulation only"));
        mvc.perform(post("/api/v1/career-intelligence/counterfactual").contentType("application/json").content("{\"targetCareer\":\"Data Analyst\",\"maxChanges\":2}" )).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/v1/career-intelligence/counterfactual").header("Authorization",auth).contentType("application/json").content("{\"targetCareer\":\"Data Analyst\",\"maxChanges\":2}"))
          .andExpect(status().isOk()).andExpect(jsonPath("$.found").value(true)).andExpect(jsonPath("$.proposedSkills[0].name").value("SQL"));
        mvc.perform(post("/api/v1/career-intelligence/counterfactual").header("Authorization",auth).contentType("application/json").content("{\"targetCareer\":\"Astronaut\",\"maxChanges\":2}" )).andExpect(status().isUnprocessableEntity());
    }

    @Test void unavailableExplanationDoesNotCorruptPredictionsOrInventOutput() throws Exception {
        String auth=register("twin-down@example.com");complete(auth);
        when(client.explain(any())).thenThrow(new ApiException(HttpStatus.SERVICE_UNAVAILABLE,"Career intelligence service is temporarily unavailable"));
        mvc.perform(get("/api/v1/career-intelligence/explanation").header("Authorization",auth)).andExpect(status().isOk()).andExpect(jsonPath("$.available").value(false)).andExpect(jsonPath("$.recommendations").isEmpty()).andExpect(jsonPath("$.availabilityMessage").value("Explanation service temporarily unavailable"));
    }

    private CareerPredictionClient.PredictionItem item(double confidence){return new CareerPredictionClient.PredictionItem("Backend Developer",confidence,List.of("Profile skill: Java"));}
    private void complete(String auth)throws Exception{
        mvc.perform(patch("/api/v1/profile").header("Authorization",auth).contentType("application/json").content("{\"degree\":\"B.Tech Computer Science\",\"graduationYear\":2027,\"targetRole\":\"Backend Developer\",\"experienceLevel\":\"ENTRY_LEVEL\"}")).andExpect(status().isOk());
        mvc.perform(put("/api/v1/profile/skills").header("Authorization",auth).contentType("application/json").content("{\"skills\":[{\"displayName\":\"Java\",\"proficiencyLevel\":\"ADVANCED\"},{\"displayName\":\"Spring Boot\",\"proficiencyLevel\":\"INTERMEDIATE\"},{\"displayName\":\"Docker\",\"proficiencyLevel\":\"BEGINNER\"}]}")).andExpect(status().isOk());
    }
    private String register(String email)throws Exception{String body="{\"fullName\":\"Career Twin Test\",\"email\":\""+email+"\",\"password\":\"Password1\",\"confirmPassword\":\"Password1\"}";JsonNode response=json.readTree(mvc.perform(post("/api/v1/auth/register").contentType("application/json").content(body)).andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());return "Bearer "+response.path("accessToken").asText();}
}
