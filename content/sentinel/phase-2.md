# Phase 2 — OAuth2 Resource Server

> Your service doesn't manage passwords. It trusts a JWT issued by an
> Authorization Server (Keycloak, Auth0, Okta, etc.) and validates it on
> every request.

## Resource Server role

```
Client → [JWT]  →  Your Service (Resource Server)
                       ↕
                   Authorization Server
                   (validates token, provides JWKS)
```

Your service:
1. Accepts `Authorization: Bearer <JWT>` on protected endpoints
2. Validates the JWT signature against the JWKS endpoint
3. Extracts authorities from the `roles` / `scope` claims
4. Grants or denies access based on those authorities

## Spring Boot auto-configuration

Add `spring-boot-starter-oauth2-resource-server` and set one property:

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: https://your-auth-server/realms/myrealm
```

Spring Security auto-configures:
- JWT decoder (fetches JWKS from `issuer-uri/.well-known/openid-configuration`)
- `BearerTokenAuthenticationFilter`
- Default `JwtAuthenticationConverter`

## Custom claims → authorities

By default, Spring maps the `scope` claim to `SCOPE_xxx` authorities.
To map custom roles you register a `JwtAuthenticationConverter` bean:

```java
@Bean
JwtAuthenticationConverter jwtAuthenticationConverter() {
    var converter = new JwtGrantedAuthoritiesConverter();
    converter.setAuthoritiesClaimName("roles");
    converter.setAuthorityPrefix("ROLE_");

    var jwtConverter = new JwtAuthenticationConverter();
    jwtConverter.setJwtGrantedAuthoritiesConverter(converter);
    return jwtConverter;
}
```

## Gradle coordinates

```groovy
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-oauth2-resource-server'
    implementation 'org.springframework.boot:spring-boot-starter-web'
    testImplementation 'org.springframework.security:spring-security-test'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
}
```
