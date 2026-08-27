package com.careerpilot.resume;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@EnabledIfEnvironmentVariable(named = "RUN_LIVE_JOB_MATCH_TEST", matches = "true")
class LiveJobMatchIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired JdbcTemplate jdbc;

    @Test
    void verifiesPostgresPersistenceOwnershipSwaggerHealthAndSectionImportance() throws Exception {
        long stamp = System.currentTimeMillis();
        String owner = register("live-job-owner-" + stamp + "@example.invalid");
        String other = register("live-job-other-" + stamp + "@example.invalid");
        byte[] pdf = ResumeParsingTest.pdf("SUMMARY", "Backend engineer", "SKILLS", "Java Spring Boot PostgreSQL REST APIs Git", "EXPERIENCE", "Built reliable backend APIs", "EDUCATION", "B.Tech Computer Science");
        JsonNode resume = json.readTree(mvc.perform(multipart("/api/v1/resumes")
                        .file(new MockMultipartFile("file", "live-job-match.pdf", "application/pdf", pdf))
                        .header("Authorization", owner))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());
        String jd = """
                Backend Developer

                We are looking for a Backend Developer with experience in Java, Spring Boot, PostgreSQL, REST APIs, Docker, Git, and Microservices.

                Responsibilities:
                - Build and maintain REST APIs using Java and Spring Boot.
                - Design backend services using microservice architecture.
                - Work with PostgreSQL databases.
                - Containerize applications using Docker.
                - Collaborate with development teams using Git.

                Required skills:
                - Java
                - Spring Boot
                - PostgreSQL
                - REST APIs
                - Git
                - Docker

                Preferred skills:
                - AWS
                - Kubernetes
                - Microservices

                Experience:
                1-3 years of backend development experience preferred.

                Education:
                Bachelor's degree in Computer Science, Information Technology, or a related field.
                """;
        String body = json.writeValueAsString(Map.of("resumeId", resume.path("id").asText(), "jobTitle", "Backend Developer", "companyName", "Verification Company", "jobDescription", jd));
        JsonNode match = json.readTree(mvc.perform(post("/api/v1/job-matches").header("Authorization", owner).contentType("application/json").content(body))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.overallMatchScore").isNumber()).andExpect(jsonPath("$.semanticStatus").value("UNAVAILABLE"))
                .andReturn().getResponse().getContentAsString());
        UUID id = UUID.fromString(match.path("id").asText());
        assertImportance(importanceFromResponse(match));
        Map<String, String> persisted = new HashMap<>();
        jdbc.query("select skill_name, importance from job_match_skills where job_match_id = ?", (rs, row) -> Map.entry(rs.getString(1), rs.getString(2)), id)
                .forEach(entry -> persisted.put(entry.getKey(), entry.getValue()));
        assertImportance(persisted);
        mvc.perform(get("/api/v1/job-matches/{id}", id).header("Authorization", owner)).andExpect(status().isOk());
        mvc.perform(get("/api/v1/job-matches").header("Authorization", owner)).andExpect(status().isOk()).andExpect(jsonPath("$[0].id").value(id.toString()));
        mvc.perform(get("/api/v1/job-matches/{id}", id).header("Authorization", other)).andExpect(status().isNotFound());
        mvc.perform(get("/v3/api-docs")).andExpect(status().isOk()).andExpect(jsonPath("$.paths['/api/v1/job-matches']").exists());
        mvc.perform(get("/actuator/health")).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("UP"));
        System.out.printf("LIVE_JOB_MATCH_RESULT id=%s classification=PERSISTED_AND_RETURNED semantic=%s history=PERSISTED ownership=PROTECTED swagger=AVAILABLE health=UP%n", id, match.path("semanticStatus").asText());
    }

    private Map<String, String> importanceFromResponse(JsonNode response) {
        Map<String, String> values = new HashMap<>();
        for (String group : List.of("matchedSkills", "partialMatches", "missingSkills")) {
            response.path(group).forEach(skill -> values.put(skill.path("skill").asText(), skill.path("importance").asText()));
        }
        return values;
    }

    private void assertImportance(Map<String, String> values) {
        assertThat(values).containsEntry("Java", "REQUIRED").containsEntry("Spring Boot", "REQUIRED")
                .containsEntry("PostgreSQL", "REQUIRED").containsEntry("REST APIs", "REQUIRED")
                .containsEntry("Git", "REQUIRED").containsEntry("Docker", "REQUIRED")
                .containsEntry("AWS", "PREFERRED").containsEntry("Kubernetes", "PREFERRED")
                .containsEntry("Microservices", "PREFERRED");
    }

    private String register(String email) throws Exception {
        String body = json.writeValueAsString(Map.of("fullName", "Live Job Match", "email", email, "password", "Password1", "confirmPassword", "Password1"));
        JsonNode response = json.readTree(mvc.perform(post("/api/v1/auth/register").contentType("application/json").content(body))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());
        return "Bearer " + response.path("accessToken").asText();
    }
}
