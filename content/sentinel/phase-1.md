# Phase 1 — Spring Security Fundamentals

> Before adding OAuth2, you need to understand how Spring Security intercepts
> requests, how the SecurityContext works, and how to write meaningful security
> configuration.

## How Spring Security works

Every HTTP request passes through a `FilterChain`. Spring Security inserts its
own filters — the most important being `SecurityContextHolderFilter` and
`AuthorizationFilter`.

```
Request
  → (other filters)
  → SecurityContextHolderFilter   — loads/saves SecurityContext
  → AuthorizationFilter           — checks if the request is permitted
  → DispatcherServlet
```

Authentication (who are you?) and Authorization (are you allowed?) are separate
concerns in Spring Security.

## SecurityContext and Authentication

The `SecurityContextHolder` stores the current user's `Authentication` object
in a thread-local. Controllers and services access it via:

```java
Authentication auth = SecurityContextHolder.getContext().getAuthentication();
```

In Spring Boot 3 / Spring Security 6, the configuration is done via
`SecurityFilterChain` beans — there is no `WebSecurityConfigurerAdapter`.

## Gradle coordinates

```groovy
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-security'
    implementation 'org.springframework.boot:spring-boot-starter-web'
    testImplementation 'org.springframework.security:spring-security-test'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
}
```

## What changed in Spring Security 6

- `WebSecurityConfigurerAdapter` removed — use `@Bean SecurityFilterChain`
- Method security uses `@EnableMethodSecurity` (not `@EnableGlobalMethodSecurity`)
- Lambda DSL is the recommended style for `HttpSecurity` configuration
