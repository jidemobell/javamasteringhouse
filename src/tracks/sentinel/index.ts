import type { Track } from '../../types';

import phase1Md from '../../../content/sentinel/phase-1.md?raw';
import phase2Md from '../../../content/sentinel/phase-2.md?raw';
import phase3Md from '../../../content/sentinel/phase-3.md?raw';
import phase4Md from '../../../content/sentinel/phase-4.md?raw';
import phase5Md from '../../../content/sentinel/phase-5.md?raw';
import phase1Run from '../../../content/sentinel/phase-1-run.md?raw';
import phase2Run from '../../../content/sentinel/phase-2-run.md?raw';
import phase3Run from '../../../content/sentinel/phase-3-run.md?raw';
import phase4Run from '../../../content/sentinel/phase-4-run.md?raw';
import phase5Run from '../../../content/sentinel/phase-5-run.md?raw';

// Track D — Sentinel (Spring Security OAuth2 + Gradle)
// Phased track teaching Spring Security 6 and OAuth2 JWT resource server patterns.

export const sentinelTrack: Track = {
  id: 'sentinel',
  name: 'Sentinel — Spring Security & OAuth2',
  description:
    'Secure Spring Boot services with Spring Security 6, OAuth2 JWT resource servers, method-level authorization, and multi-tenancy. Gradle-based, phased from security fundamentals to production token validation.',
  mode: 'phased',
  phases: [
    {
      id: 'phase-1',
      index: 1,
      title: 'Spring Security Fundamentals',
      subtitle: 'FilterChain, SecurityContext, and HttpSecurity DSL',
      difficulty: 'entry',
      sourceRef: 'general-knowlegde/spring-security/fundamentals.md',
      concepts: ['spring-security'],
      overview: phase1Md,
      runInstructions: phase1Run,
      tasks: [
        {
          id: 'security-filter-chain',
          title: 'Configure a SecurityFilterChain',
          concepts: ['spring-security'],
          brief: `
> 🧠 **Concept — SecurityFilterChain**
>
> In Spring Security 6, security rules are defined via a \`SecurityFilterChain\`
> bean. There is no \`WebSecurityConfigurerAdapter\` — it was removed in 6.0.
>
> - ✅ Use the lambda DSL: \`http.authorizeHttpRequests(auth -> ...)\`
> - ✅ Disable CSRF for stateless APIs that use JWT or API keys
> - ❌ Use \`antMatchers\` — replaced by \`requestMatchers\` in Spring Security 6
>
> Mental model: \`SecurityFilterChain\` is a list of rules applied in order.
> The first matching rule wins. Put narrow rules (specific paths) before
> broad rules (anyRequest).

Write a \`@Configuration\` class that:
1. Permits \`GET /public/**\` without authentication
2. Requires authentication for all other requests
3. Enables HTTP Basic for the test
`,
          samples: [
            {
              filename: 'SecurityConfig.java',
              language: 'java',
              starter: `package sentinel.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // TODO: permit GET /public/**
        // TODO: require authentication for all other requests
        // TODO: enable HTTP Basic
        return http.build();
    }
}
`,
              reference: `package sentinel.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/public/**").permitAll()
                .anyRequest().authenticated()
            )
            .httpBasic(basic -> {})
            .build();
    }
}
`,
            },
          ],
        },
        {
          id: 'in-memory-users',
          title: 'Define in-memory users for testing',
          concepts: ['spring-security'],
          brief: `
For integration tests you often want a deterministic set of users without
a real database or Keycloak. Spring Security provides \`InMemoryUserDetailsManager\`.

Create a \`UserDetailsService\` bean with two users:
- \`user\` with role \`USER\` and password \`password\`
- \`admin\` with roles \`USER\`, \`ADMIN\` and password \`admin\`

Write a \`@SpringBootTest\` using \`WebTestClient\` (or \`MockMvc\`) that verifies:
- \`user\` can reach \`GET /protected/hello\`
- Unauthenticated request gets \`401\`
- \`admin\` can reach \`GET /admin/dashboard\`
- \`user\` gets \`403\` on \`GET /admin/dashboard\`
`,
          samples: [
            {
              filename: 'UserConfig.java',
              language: 'java',
              starter: `package sentinel.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.UserDetailsService;

@Configuration
public class UserConfig {

    @Bean
    public UserDetailsService userDetailsService() {
        // TODO: return an InMemoryUserDetailsManager with 'user' and 'admin'
        return null;
    }
}
`,
              reference: `package sentinel.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;

@Configuration
public class UserConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService(PasswordEncoder enc) {
        var user = User.withUsername("user")
            .password(enc.encode("password"))
            .roles("USER")
            .build();
        var admin = User.withUsername("admin")
            .password(enc.encode("admin"))
            .roles("USER", "ADMIN")
            .build();
        return new InMemoryUserDetailsManager(user, admin);
    }
}
`,
            },
          ],
        },
      ],
    },
    {
      id: 'phase-2',
      index: 2,
      title: 'OAuth2 Resource Server',
      subtitle: 'JWT validation and authority mapping',
      difficulty: 'mid',
      sourceRef: 'general-knowlegde/spring-security/oauth2-resource-server.md',
      concepts: ['spring-security', 'oauth2'],
      overview: phase2Md,
      runInstructions: phase2Run,
      tasks: [
        {
          id: 'jwt-resource-server',
          title: 'Configure JWT resource server',
          concepts: ['oauth2'],
          brief: `
> 🧠 **Concept — JWT Resource Server**
>
> A resource server never stores passwords. It validates every request by
> checking the JWT signature against the Authorization Server's public keys
> (JWKS endpoint). The token carries all identity and role information.
>
> - ✅ Set \`spring.security.oauth2.resourceserver.jwt.issuer-uri\` — Spring
>   fetches the JWKS and caches it automatically
> - ✅ Use \`oauth2ResourceServer(oauth2 -> oauth2.jwt(...))\` in the filter chain
> - ❌ Decode the JWT yourself — Spring Security's decoder handles key rotation,
>   expiry, and issuer validation for you
>
> Mental model: the Authorization Server mints tokens; your service only
> *checks* them. You trust the token, not the caller's identity claim.

Configure \`SecurityFilterChain\` to use JWT resource server authentication.
Register a \`JwtAuthenticationConverter\` that maps a custom \`roles\` claim
to \`ROLE_xxx\` Spring Security authorities.

Write a \`@WebMvcTest\` using \`@WithMockUser\` or \`SecurityMockMvcRequestPostProcessors.jwt()\`
to verify that a token with role \`ADMIN\` can reach \`GET /api/admin\` and a
token with only role \`USER\` gets \`403\`.
`,
          samples: [
            {
              filename: 'OAuth2SecurityConfig.java',
              language: 'java',
              starter: `package sentinel.oauth2;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class OAuth2SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // TODO: stateless sessions
        // TODO: require ADMIN role for /api/admin/**
        // TODO: require authentication for all other requests
        // TODO: configure JWT resource server with custom converter
        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        // TODO: map 'roles' claim with prefix ROLE_
        return new JwtAuthenticationConverter();
    }
}
`,
              reference: `package sentinel.oauth2;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class OAuth2SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
            )
            .build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter grantedAuthorities = new JwtGrantedAuthoritiesConverter();
        grantedAuthorities.setAuthoritiesClaimName("roles");
        grantedAuthorities.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(grantedAuthorities);
        return converter;
    }
}
`,
            },
          ],
        },
      ],
    },
    {
      id: 'phase-3',
      index: 3,
      title: 'Method Security',
      subtitle: '@PreAuthorize, @PostAuthorize, and SpEL expressions',
      difficulty: 'mid',
      sourceRef: 'general-knowlegde/spring-security/method-security.md',
      concepts: ['spring-security'],
      overview: phase3Md,
      runInstructions: phase3Run,
      tasks: [
        {
          id: 'pre-authorize',
          title: 'Secure methods with @PreAuthorize',
          concepts: ['spring-security'],
          brief: `
> 🧠 **Concept — Method Security**
>
> \`@PreAuthorize\` enforces access control at the *service layer*, not just
> at the HTTP layer. This means the rule applies regardless of how the method
> is invoked — from a controller, a scheduled job, or another service.
>
> - ✅ Use SpEL expressions for fine-grained rules: \`#userId == authentication.name\`
> - ✅ Add \`@EnableMethodSecurity\` to your configuration class
> - ❌ Rely solely on \`requestMatchers\` — if a scheduled job or test calls
>   the service directly, the HTTP-level rule is bypassed
>
> Mental model: HTTP security is the front door; method security is the lock
> on each room. You need both.

Enable method security, then annotate a \`deleteItem\` service method so that:
- Admins can delete any item
- Regular users get \`AccessDeniedException\`

Write two \`@Test\` methods using \`@WithMockUser\` to verify both cases.
`,
          samples: [
            {
              filename: 'ItemService.java',
              language: 'java',
              starter: `package sentinel.service;

import org.springframework.stereotype.Service;

@Service
public class ItemService {

    // TODO: annotate so only ADMIN role can call this method
    public void deleteItem(Long id) {
        // simulated delete
        System.out.println("Deleted item " + id);
    }

    // TODO: annotate so users can only access their own items
    //       (param: String ownerId, must equal authentication.name or be ADMIN)
    public String getItem(Long id, String ownerId) {
        return "item-" + id + " owned by " + ownerId;
    }
}
`,
              reference: `package sentinel.service;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

@Service
public class ItemService {

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteItem(Long id) {
        System.out.println("Deleted item " + id);
    }

    @PreAuthorize("#ownerId == authentication.name or hasRole('ADMIN')")
    public String getItem(Long id, String ownerId) {
        return "item-" + id + " owned by " + ownerId;
    }
}
`,
            },
            {
              filename: 'ItemServiceTest.java',
              language: 'java',
              starter: `package sentinel.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.test.context.support.WithMockUser;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class ItemServiceTest {

    @Autowired
    ItemService service;

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminCanDelete() {
        // TODO: call deleteItem — should not throw
    }

    @Test
    @WithMockUser(roles = "USER")
    void userCannotDelete() {
        // TODO: call deleteItem — should throw AccessDeniedException
    }
}
`,
              reference: `package sentinel.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.test.context.support.WithMockUser;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class ItemServiceTest {

    @Autowired
    ItemService service;

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminCanDelete() {
        assertDoesNotThrow(() -> service.deleteItem(1L));
    }

    @Test
    @WithMockUser(roles = "USER")
    void userCannotDelete() {
        assertThrows(AccessDeniedException.class, () -> service.deleteItem(1L));
    }
}
`,
            },
          ],
        },
      ],
    },
    {
      id: 'phase-4',
      index: 4,
      title: 'Multi-Tenancy & Data Isolation',
      subtitle: 'Discriminator column pattern with Hibernate filters',
      difficulty: 'advanced',
      sourceRef: 'general-knowlegde/spring-security/multi-tenancy.md',
      concepts: ['spring-security', 'jpa'],
      overview: phase4Md,
      runInstructions: phase4Run,
      tasks: [
        {
          id: 'tenant-context',
          title: 'Resolve and store the current tenant',
          concepts: ['spring-security'],
          brief: `
> 🧠 **Concept — Tenant Resolution**
>
> Every request in a multi-tenant system must be associated with exactly one
> tenant before any data access occurs. Resolving the tenant is a cross-cutting
> concern — it belongs in a filter, not in every controller.
>
> - ✅ Use \`OncePerRequestFilter\` — guaranteed to run once per request,
>   even for forwarded requests
> - ✅ Store the tenant in a \`ThreadLocal\` — it's available anywhere on
>   the same thread without passing it as a parameter
> - ❌ Read the tenant header in each service method — noisy, error-prone,
>   and easy to forget
>
> Mental model: the tenant context is like the current \`Authentication\` —
> set once at the boundary, read anywhere within the request lifecycle.

Build \`TenantFilter extends OncePerRequestFilter\` that:
1. Reads the \`X-Tenant-ID\` header
2. Stores it in \`TenantContext.set(tenantId)\` (a \`ThreadLocal\` holder)
3. Clears it in \`finally\` to prevent context leaking between requests

Write a \`MockMvc\` test verifying the tenant is correctly set during the request.
`,
          samples: [
            {
              filename: 'TenantContext.java',
              language: 'java',
              starter: `package sentinel.tenant;

public class TenantContext {
    private static final ThreadLocal<String> CURRENT = new ThreadLocal<>();

    public static void set(String tenantId) { CURRENT.set(tenantId); }
    public static String get()              { return CURRENT.get(); }
    public static void clear()              { CURRENT.remove(); }
}
`,
              reference: `package sentinel.tenant;

public class TenantContext {
    private static final ThreadLocal<String> CURRENT = new ThreadLocal<>();

    public static void set(String tenantId) { CURRENT.set(tenantId); }
    public static String get()              { return CURRENT.get(); }
    public static void clear()              { CURRENT.remove(); }
}
`,
            },
            {
              filename: 'TenantFilter.java',
              language: 'java',
              starter: `package sentinel.tenant;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class TenantFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {
        // TODO: read X-Tenant-ID header
        // TODO: store in TenantContext
        // TODO: call chain.doFilter in a try block; clear context in finally
    }
}
`,
              reference: `package sentinel.tenant;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class TenantFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {
        String tenantId = request.getHeader("X-Tenant-ID");
        try {
            if (tenantId != null && !tenantId.isBlank()) {
                TenantContext.set(tenantId);
            }
            chain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}
`,
            },
          ],
        },
      ],
    },
    {
      id: 'phase-5',
      index: 5,
      title: 'Resilience4j Circuit Breaker',
      subtitle: 'Protect downstream auth dependencies from cascading failure',
      difficulty: 'advanced',
      sourceRef: 'general-knowlegde/spring-security/resilience4j.md',
      concepts: ['spring-security', 'resilience'],
      overview: phase5Md,
      runInstructions: phase5Run,
      tasks: [
        {
          id: 'circuit-breaker-config',
          title: 'Configure and apply a circuit breaker',
          concepts: ['resilience'],
          brief: `
> 🧠 **Concept — Circuit Breaker**
>
> A circuit breaker tracks failure rates over a sliding window. Once the
> failure rate exceeds a threshold, it *opens* and all calls fail fast
> without hitting the downstream service — protecting both the caller and
> the dependency from a cascade.
>
> - ✅ Always provide a \`fallbackMethod\` — open-circuit calls must not throw
>   unexpected exceptions to callers
> - ✅ Use actuator health indicators to observe circuit state in ops dashboards
> - ❌ Set failure thresholds too low (< 30%) — transient errors will open
>   the circuit and create false outages
>
> Mental model: the circuit breaker is an automated supervisor. When it sees
> too many failures, it steps in, fails fast, and checks periodically whether
> the downstream is healthy again.

Add \`@CircuitBreaker\` to a \`UserDetailsService.loadUser()\` method that calls
an external auth service (simulated). The fallback must throw
\`AuthenticationServiceException\` so Spring Security correctly returns 503.

Write a test that forces failures until the circuit opens, then verifies the
fallback is invoked without hitting the downstream service.
`,
          samples: [
            {
              filename: 'ExternalUserDetailsService.java',
              language: 'java',
              starter: `package sentinel.resilience;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class ExternalUserDetailsService implements UserDetailsService {

    // TODO: annotate with @CircuitBreaker(name="authServer", fallbackMethod="fallback")
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Simulates a call to an external auth server
        return callAuthServer(username);
    }

    private UserDetails callAuthServer(String username) {
        // TODO: simulate the downstream call (throw on odd invocations to test)
        throw new RuntimeException("auth server unavailable");
    }

    // TODO: implement fallback method with correct signature
}
`,
              reference: `package sentinel.resilience;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class ExternalUserDetailsService implements UserDetailsService {

    @CircuitBreaker(name = "authServer", fallbackMethod = "fallback")
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return callAuthServer(username);
    }

    private UserDetails callAuthServer(String username) {
        // In a real service this would be an HTTP call to Keycloak / Auth0
        throw new RuntimeException("auth server unavailable");
    }

    @SuppressWarnings("unused")
    private UserDetails fallback(String username, Exception e) {
        throw new AuthenticationServiceException(
            "Authentication service unavailable — try again shortly", e);
    }
}
`,
            },
          ],
        },
      ],
    },
  ],
};
