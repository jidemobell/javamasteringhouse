# Phase 4 — Multi-Tenancy & JPA Isolation

> In a multi-tenant system, every request belongs to a tenant. Data for one
> tenant must be completely invisible to another. This phase covers the
> discriminator column pattern — the simplest strategy that works without
> separate schemas or databases.

## Three isolation strategies

| Strategy | How | Tradeoffs |
|----------|-----|-----------|
| Discriminator column | All tenants share tables; `tenant_id` column filters rows | Simple, scales to many tenants; SQL bugs can leak data |
| Schema per tenant | Separate Postgres schema per tenant | Strong isolation; schema migration complexity grows |
| Database per tenant | Separate database per tenant | Strongest isolation; expensive |

## Discriminator column with Hibernate Filters

Spring's `@FilterDef` and `@Filter` (Hibernate) automatically append
`WHERE tenant_id = :tenantId` to every query when activated:

```java
@Entity
@FilterDef(name = "tenantFilter", parameters = @ParamDef(name = "tenantId", type = String.class))
@Filter(name = "tenantFilter", condition = "tenant_id = :tenantId")
public class Item { ... }
```

Activate per request via an interceptor:

```java
Session session = entityManager.unwrap(Session.class);
session.enableFilter("tenantFilter").setParameter("tenantId", currentTenant());
```

## Resolving the current tenant

Common approaches:
- JWT claim (`tenant` or `org` field)
- Subdomain (`tenant.example.com`)
- Request header (`X-Tenant-ID`)

Store in a `ThreadLocal` via a Spring `HandlerInterceptor` or `OncePerRequestFilter`.

## Gradle coordinates

```groovy
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-security'
    runtimeOnly 'com.h2database:h2'
}
```
