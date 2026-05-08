# Phase 5 — Resilience4j Circuit Breaker

> Authentication and authorization depend on downstream services (the Auth Server,
> a user directory). When those services are slow or down, your security layer
> must not cascade the failure to every caller.

## Circuit breaker states

```
CLOSED → normal operation, requests flow through
   ↓  (failure rate exceeds threshold)
OPEN  → all requests fail fast (no downstream call)
   ↓  (after wait duration)
HALF_OPEN → limited calls allowed to test recovery
   ↓  (success rate OK)
CLOSED
```

## Resilience4j with Spring Boot

Spring Boot auto-configures Resilience4j via `application.yml`:

```yaml
resilience4j:
  circuitbreaker:
    instances:
      authServer:
        failure-rate-threshold: 50       # open after 50% failures
        wait-duration-in-open-state: 10s
        sliding-window-size: 10
        permitted-number-of-calls-in-half-open-state: 3
```

Annotate the method:

```java
@CircuitBreaker(name = "authServer", fallbackMethod = "authFallback")
public UserDetails loadUser(String username) { ... }

private UserDetails authFallback(String username, Exception e) {
    throw new AuthenticationServiceException("auth server unavailable", e);
}
```

## Retry and TimeLimiter

Resilience4j also provides:
- `@Retry` — retry on transient failures with backoff
- `@TimeLimiter` — enforce a max duration on an async call
- `@Bulkhead` — limit concurrent calls to protect a downstream service

## Gradle coordinates

```groovy
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-aop'
    implementation 'io.github.resilience4j:resilience4j-spring-boot3:2.2.0'
}
```
