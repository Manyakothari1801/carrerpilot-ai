package com.careerpilot.health;

import com.careerpilot.config.SecurityProperties;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

@Component("authConfiguration")
public class AuthenticationConfigurationHealthIndicator implements HealthIndicator {
    private final SecurityProperties properties;
    public AuthenticationConfigurationHealthIndicator(SecurityProperties properties){this.properties=properties;}

    @Override public Health health(){
        boolean valid=properties.jwtSecret()!=null&&properties.jwtSecret().length()>=32
                &&properties.accessExpiration()!=null&&!properties.accessExpiration().isNegative()&&!properties.accessExpiration().isZero()
                &&properties.refreshExpiration()!=null&&!properties.refreshExpiration().isNegative()&&!properties.refreshExpiration().isZero();
        return valid?Health.up().withDetail("configuration","valid").build():Health.down().withDetail("configuration","invalid").build();
    }
}
