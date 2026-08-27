package com.careerpilot.resume;
import com.fasterxml.jackson.databind.*;import org.junit.jupiter.api.*;import org.springframework.beans.factory.annotation.Autowired;import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;import org.springframework.boot.test.context.SpringBootTest;import org.springframework.jdbc.core.JdbcTemplate;import org.springframework.mock.web.MockMultipartFile;import org.springframework.test.context.ActiveProfiles;import org.springframework.test.web.servlet.MockMvc;import java.util.*;import static org.assertj.core.api.Assertions.assertThat;import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:jobmatch;MODE=PostgreSQL;DB_CLOSE_DELAY=-1","spring.datasource.driver-class-name=org.h2.Driver","spring.datasource.username=sa","spring.datasource.password=","spring.jpa.hibernate.ddl-auto=create-drop","spring.flyway.enabled=false","careerpilot.resume.storage-path=./target/test-job-match-storage","careerpilot.embedding.enabled=false"})@AutoConfigureMockMvc@ActiveProfiles("test")
class JobMatchFlowIntegrationTest{@Autowired MockMvc mvc;@Autowired ObjectMapper json;@Autowired JdbcTemplate jdbc;
 @Test void createsPersistsListsAndProtectsOwnedMatch()throws Exception{String owner=register("job-owner@example.com"),other=register("job-other@example.com");JsonNode resume=upload(owner);String jd="Required qualifications include Java, Spring Boot, PostgreSQL, REST APIs and Docker. Build reliable microservices with Git. Preferred experience with AWS and TypeScript for backend platform responsibilities.";String body="{\"resumeId\":\""+resume.path("id").asText()+"\",\"jobTitle\":\"Backend Developer\",\"companyName\":\"Example Co\",\"jobDescription\":\""+jd+"\"}";JsonNode match=json.readTree(mvc.perform(post("/api/v1/job-matches").header("Authorization",owner).contentType("application/json").content(body)).andExpect(status().isCreated()).andExpect(jsonPath("$.overallMatchScore").isNumber()).andExpect(jsonPath("$.skillMatchScore").isNumber()).andExpect(jsonPath("$.keywordMatchScore").isNumber()).andExpect(jsonPath("$.semanticStatus").value("UNAVAILABLE")).andExpect(jsonPath("$.matchedSkills").isArray()).andExpect(jsonPath("$.missingSkills").isArray()).andReturn().getResponse().getContentAsString());String id=match.path("id").asText();mvc.perform(get("/api/v1/job-matches").header("Authorization",owner)).andExpect(status().isOk()).andExpect(jsonPath("$[0].id").value(id));mvc.perform(get("/api/v1/job-matches/{id}",id).header("Authorization",owner)).andExpect(status().isOk()).andExpect(jsonPath("$.jobTitle").value("Backend Developer"));mvc.perform(get("/api/v1/job-matches/{id}",id).header("Authorization",other)).andExpect(status().isNotFound());}
 @Test void rejectsTooShortDescriptionAndUnownedResume()throws Exception{String first=register("job-validation@example.com"),second=register("job-intruder@example.com");JsonNode resume=upload(first);String shortBody="{\"resumeId\":\""+resume.path("id").asText()+"\",\"jobTitle\":\"Role\",\"jobDescription\":\"Too short\"}";mvc.perform(post("/api/v1/job-matches").header("Authorization",first).contentType("application/json").content(shortBody)).andExpect(status().isBadRequest());String jd="A sufficiently detailed job description requiring Java Spring Boot PostgreSQL Docker REST APIs Git and microservices for reliable backend platform development and delivery.";String foreign=shortBody.replace("Too short",jd);mvc.perform(post("/api/v1/job-matches").header("Authorization",second).contentType("application/json").content(foreign)).andExpect(status().isNotFound());}
 @Test void exactJobDescriptionPersistsAndReturnsSectionImportance()throws Exception{String owner=register("job-sections@example.com");JsonNode resume=upload(owner);String jd="""
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
""";String body=json.writeValueAsString(Map.of("resumeId",resume.path("id").asText(),"jobTitle","Backend Developer","jobDescription",jd));JsonNode response=json.readTree(mvc.perform(post("/api/v1/job-matches").header("Authorization",owner).contentType("application/json").content(body)).andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());UUID matchId=UUID.fromString(response.path("id").asText());Map<String,String>apiImportance=new HashMap<>();for(String group:List.of("matchedSkills","partialMatches","missingSkills"))response.path(group).forEach(skill->apiImportance.put(skill.path("skill").asText(),skill.path("importance").asText()));assertImportance(apiImportance);Map<String,String>storedImportance=new HashMap<>();for(Map<String,Object> row:jdbc.queryForList("select skill_name, importance from job_match_skills where job_match_id = ?",matchId))storedImportance.put(row.get("SKILL_NAME").toString(),row.get("IMPORTANCE").toString());assertImportance(storedImportance);assertThat(jdbc.queryForObject("select job_description from job_matches where id = ?",String.class,matchId)).isEqualTo(jd.strip());}
 private void assertImportance(Map<String,String> values){assertThat(values).containsEntry("Java","REQUIRED").containsEntry("Spring Boot","REQUIRED").containsEntry("PostgreSQL","REQUIRED").containsEntry("REST APIs","REQUIRED").containsEntry("Git","REQUIRED").containsEntry("Docker","REQUIRED").containsEntry("AWS","PREFERRED").containsEntry("Kubernetes","PREFERRED").containsEntry("Microservices","PREFERRED");}
 private JsonNode upload(String auth)throws Exception{byte[]pdf=ResumeParsingTest.pdf("SUMMARY","Backend engineer","SKILLS","Java Spring Boot PostgreSQL Git REST APIs","EXPERIENCE","Built reliable APIs","EDUCATION","B.Tech Computer Science");return json.readTree(mvc.perform(multipart("/api/v1/resumes").file(new MockMultipartFile("file","match.pdf","application/pdf",pdf)).header("Authorization",auth)).andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());}
 private String register(String email)throws Exception{String body="{\"fullName\":\"Job Match Test\",\"email\":\""+email+"\",\"password\":\"Password1\",\"confirmPassword\":\"Password1\"}";JsonNode response=json.readTree(mvc.perform(post("/api/v1/auth/register").contentType("application/json").content(body)).andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());return"Bearer "+response.path("accessToken").asText();}}
