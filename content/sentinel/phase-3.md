# Phase 3 — Method Security

> Endpoint-level security (`requestMatchers`) is coarse-grained. Method security
> lets you enforce access rules at the service layer, regardless of how the method
> is called.

## @EnableMethodSecurity

Activate method security in your configuration class:

```java
@EnableMethodSecurity   // Spring Security 6 — not @EnableGlobalMethodSecurity
```

## Key annotations

| Annotation | Purpose |
|-----------|---------|
| `@PreAuthorize` | Evaluate expression *before* the method runs |
| `@PostAuthorize` | Evaluate expression *after* method returns (can inspect result) |
| `@Secured` | Simpler role-only check (no SpEL) |
| `@RolesAllowed` | JSR-250 equivalent of `@Secured` |

## SpEL expressions in @PreAuthorize

```java
// Only admins
@PreAuthorize("hasRole('ADMIN')")

// Must have a specific scope (OAuth2)
@PreAuthorize("hasAuthority('SCOPE_read:items')")

// Can access their own data or is an admin
@PreAuthorize("#userId == authentication.name or hasRole('ADMIN')")

// Access the returned object (PostAuthorize)
@PostAuthorize("returnObject.owner == authentication.name")
```

## Testing method security

Use `@WithMockUser` to set a fake security context in tests:

```java
@Test
@WithMockUser(roles = "ADMIN")
void adminCanDelete() { ... }

@Test
@WithMockUser(roles = "USER")
void userCannotDelete() {
    assertThrows(AccessDeniedException.class, () -> service.delete(1L));
}
```

## Gradle coordinates

```groovy
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-security'
    testImplementation 'org.springframework.security:spring-security-test'
}
```
