package com.careerpilot.careerrecommendation;

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

@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:careerrec;MODE=PostgreSQL;DB_CLOSE_DELAY=-1","spring.datasource.driver-class-name=org.h2.Driver","spring.datasource.username=sa","spring.datasource.password=","spring.jpa.hibernate.ddl-auto=create-drop","spring.flyway.enabled=false"})
@AutoConfigureMockMvc @ActiveProfiles("test")
class CareerRecommendationFlowIntegrationTest {
    @Autowired MockMvc mvc; @Autowired ObjectMapper json; @Autowired JdbcTemplate jdbc;
    @MockitoBean CareerPredictionClient predictionClient;

    @Test void generatesPersistsListsAndProtectsOwnedPrediction() throws Exception {
        String owner=register("career-owner@example.com"),other=register("career-other@example.com");complete(owner);
        when(predictionClient.predict(any())).thenReturn(success());
        JsonNode created=json.readTree(mvc.perform(post("/api/v1/career-recommendations").header("Authorization",owner))
          .andExpect(status().isCreated()).andExpect(jsonPath("$.modelVersion").value("career-rec-test-v1"))
          .andExpect(jsonPath("$.recommendations[0].career").value("Backend Developer"))
          .andExpect(jsonPath("$.recommendations[0].confidence").value(.72))
          .andReturn().getResponse().getContentAsString());
        String id=created.path("id").asText();
        assertThat(jdbc.queryForObject("select count(*) from career_recommendations where id=?",Integer.class,java.util.UUID.fromString(id))).isEqualTo(1);
        assertThat(jdbc.queryForObject("select count(*) from career_recommendation_items where recommendation_id=?",Integer.class,java.util.UUID.fromString(id))).isEqualTo(3);
        mvc.perform(get("/api/v1/career-recommendations").header("Authorization",owner)).andExpect(status().isOk()).andExpect(jsonPath("$[0].id").value(id));
        mvc.perform(get("/api/v1/career-recommendations/{id}",id).header("Authorization",owner)).andExpect(status().isOk());
        mvc.perform(get("/api/v1/career-recommendations/{id}",id).header("Authorization",other)).andExpect(status().isNotFound());
        verify(predictionClient).predict(argThat(request->request.skills().size()==3&&request.topN()==3&&"Backend Developer".equals(request.targetRole())));
    }

    @Test void reportsMissingFieldsWithoutCallingMl() throws Exception {
        String auth=register("career-not-ready@example.com");
        mvc.perform(get("/api/v1/career-recommendations/readiness").header("Authorization",auth)).andExpect(status().isOk())
          .andExpect(jsonPath("$.ready").value(false)).andExpect(jsonPath("$.missingFields").isArray());
        mvc.perform(post("/api/v1/career-recommendations").header("Authorization",auth)).andExpect(status().isUnprocessableEntity());
        verifyNoInteractions(predictionClient);
    }

    @Test void serviceFailureDoesNotPersistFabricatedFallback() throws Exception {
        String auth=register("career-down@example.com");complete(auth);
        when(predictionClient.predict(any())).thenThrow(new ApiException(HttpStatus.SERVICE_UNAVAILABLE,"Career recommendation service is temporarily unavailable"));
        mvc.perform(post("/api/v1/career-recommendations").header("Authorization",auth)).andExpect(status().isServiceUnavailable());
        assertThat(jdbc.queryForObject("select count(*) from career_recommendations",Integer.class)).isZero();
    }

    private CareerPredictionClient.PredictionResponse success(){return new CareerPredictionClient.PredictionResponse("career-rec-test-v1","profile-features-v1",List.of(
      new CareerPredictionClient.PredictionItem("Backend Developer",.72,List.of("Profile skill: Java","Profile skill: Spring Boot")),
      new CareerPredictionClient.PredictionItem("QA Automation Engineer",.17,List.of("Profile skill: Java")),
      new CareerPredictionClient.PredictionItem("Cloud DevOps Engineer",.11,List.of("Profile skill: Docker"))));}
    private void complete(String auth)throws Exception{
        mvc.perform(patch("/api/v1/profile").header("Authorization",auth).contentType("application/json").content("{\"degree\":\"B.Tech Computer Science\",\"graduationYear\":2027,\"targetRole\":\"Backend Developer\",\"experienceLevel\":\"ENTRY_LEVEL\"}")).andExpect(status().isOk());
        mvc.perform(put("/api/v1/profile/skills").header("Authorization",auth).contentType("application/json").content("{\"skills\":[{\"displayName\":\"Java\",\"proficiencyLevel\":\"ADVANCED\"},{\"displayName\":\"Spring Boot\",\"proficiencyLevel\":\"INTERMEDIATE\"},{\"displayName\":\"Docker\",\"proficiencyLevel\":\"BEGINNER\"}]}")).andExpect(status().isOk());
    }
    private String register(String email)throws Exception{String body="{\"fullName\":\"Career Test\",\"email\":\""+email+"\",\"password\":\"Password1\",\"confirmPassword\":\"Password1\"}";JsonNode response=json.readTree(mvc.perform(post("/api/v1/auth/register").contentType("application/json").content(body)).andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());return "Bearer "+response.path("accessToken").asText();}
}
