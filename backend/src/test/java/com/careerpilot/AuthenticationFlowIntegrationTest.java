package com.careerpilot;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:auth;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.flyway.enabled=false"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthenticationFlowIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;

    @Test void registrationLoginAndProtectedIdentityFlow() throws Exception {
        JsonNode tokens = register("identity@example.com");
        mvc.perform(post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON).content(registration("identity@example.com"))).andExpect(status().isConflict());
        mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"identity@example.com\",\"password\":\"WrongPass1\"}")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/v1/auth/me").header("Authorization", bearer(tokens))).andExpect(status().isOk()).andExpect(jsonPath("$.email").value("identity@example.com")).andExpect(jsonPath("$.role").value("STUDENT"));
    }

    @Test void refreshTokensRotateAndLogoutRevokesSession() throws Exception {
        JsonNode first = register("rotation@example.com");
        String oldRefresh = first.get("refreshToken").asText();
        JsonNode rotated = body(mvc.perform(post("/api/v1/auth/refresh").contentType(MediaType.APPLICATION_JSON).content(refreshBody(oldRefresh))).andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
        mvc.perform(post("/api/v1/auth/refresh").contentType(MediaType.APPLICATION_JSON).content(refreshBody(oldRefresh))).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/v1/auth/logout").header("Authorization", bearer(rotated)).contentType(MediaType.APPLICATION_JSON).content(refreshBody(rotated.get("refreshToken").asText()))).andExpect(status().isOk());
        mvc.perform(post("/api/v1/auth/refresh").contentType(MediaType.APPLICATION_JSON).content(refreshBody(rotated.get("refreshToken").asText()))).andExpect(status().isUnauthorized());
    }

    @Test void profileAndSkillsCanBeMaintained() throws Exception {
        String auth = bearer(register("profile@example.com"));
        mvc.perform(patch("/api/v1/profile").header("Authorization", auth).contentType(MediaType.APPLICATION_JSON).content("{\"college\":\"Example Institute\",\"degree\":\"B.Tech\",\"graduationYear\":2027,\"targetRole\":\"Software Engineer\",\"experienceLevel\":\"ENTRY_LEVEL\",\"githubUrl\":\"https://github.com/student\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.college").value("Example Institute"));
        mvc.perform(put("/api/v1/profile/skills").header("Authorization", auth).contentType(MediaType.APPLICATION_JSON).content("{\"skills\":[{\"displayName\":\"Java\",\"proficiencyLevel\":\"INTERMEDIATE\"},{\"displayName\":\" java \",\"proficiencyLevel\":\"ADVANCED\"}]}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1)).andExpect(jsonPath("$[0].displayName").value("java")).andExpect(jsonPath("$[0].proficiencyLevel").value("ADVANCED"));
    }

    @Test void passwordResetIsSingleUseAndRevokesExistingSessions() throws Exception {
        JsonNode original = register("reset@example.com");
        JsonNode forgot = body(mvc.perform(post("/api/v1/auth/forgot-password").contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"reset@example.com\"}")).andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
        String resetToken = forgot.get("developmentResetToken").asText();
        String payload = "{\"token\":\"" + resetToken + "\",\"password\":\"NewPassword2\",\"confirmPassword\":\"NewPassword2\"}";
        mvc.perform(post("/api/v1/auth/reset-password").contentType(MediaType.APPLICATION_JSON).content(payload)).andExpect(status().isOk());
        mvc.perform(post("/api/v1/auth/reset-password").contentType(MediaType.APPLICATION_JSON).content(payload)).andExpect(status().isBadRequest());
        mvc.perform(post("/api/v1/auth/refresh").contentType(MediaType.APPLICATION_JSON).content(refreshBody(original.get("refreshToken").asText()))).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"reset@example.com\",\"password\":\"NewPassword2\"}")).andExpect(status().isOk());
    }

    private JsonNode register(String email) throws Exception {
        return body(mvc.perform(post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON).content(registration(email))).andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());
    }
    private String registration(String email) { return "{\"fullName\":\"Test Student\",\"email\":\"" + email + "\",\"password\":\"Password1\",\"confirmPassword\":\"Password1\"}"; }
    private String refreshBody(String token) { return "{\"refreshToken\":\"" + token + "\"}"; }
    private String bearer(JsonNode response) { return "Bearer " + response.get("accessToken").asText(); }
    private JsonNode body(String value) throws Exception { return json.readTree(value); }
}
