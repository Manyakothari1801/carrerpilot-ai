package com.careerpilot.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.ActiveProfiles;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:security;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=none",
        "spring.flyway.enabled=false"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityConfigTest {
    @Autowired MockMvc mockMvc;

    @Test void healthIsPublic() throws Exception {
        mockMvc.perform(get("/actuator/health")).andExpect(status().isOk());
        mockMvc.perform(get("/actuator/health/readiness")).andExpect(status().isOk());
    }

    @Test void applicationEndpointsAreProtected() throws Exception {
        mockMvc.perform(get("/api/v1/future-module")).andExpect(status().isUnauthorized());
    }

    @Test void corsPreflightAllowsConfiguredFrontendAndRequestIdIsReturned() throws Exception {
        mockMvc.perform(options("/api/v1/auth/login").header("Origin","http://localhost:5173").header("Access-Control-Request-Method","POST").header("Access-Control-Request-Headers","content-type,x-request-id"))
                .andExpect(status().isOk()).andExpect(header().string("Access-Control-Allow-Origin","http://localhost:5173"));
        mockMvc.perform(get("/actuator/health").header("X-Request-Id","test-request-123"))
                .andExpect(header().string("X-Request-Id","test-request-123"));
    }
}
