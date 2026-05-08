# Phase 5 — Spring Cache & Redis

> Adding a cache layer to a reactive service requires reactive-aware caching.
> Spring Cache's `@Cacheable` blocks — you need `ReactiveRedisTemplate` or
> a manual `Mono.cache()` approach for true non-blocking caching.

## The blocking trap

`@Cacheable` on a method returning `Mono<T>` does not work as expected in WebFlux.
The cache intercept calls `.block()` internally, which deadlocks on Netty threads.

## Two correct approaches

### 1. Reactor `cache()` operator (in-process)

```java
private final Mono<Config> cachedConfig = configService.load()
    .cache(Duration.ofMinutes(10));
```

`cache()` materialises the Mono once, shares the result with all subscribers,
and re-fetches after the TTL expires. Good for singleton, rarely-changing data.

### 2. ReactiveRedisTemplate (distributed)

```java
reactiveRedisTemplate.opsForValue()
    .get(key)
    .switchIfEmpty(
        repo.findById(id)
            .flatMap(item ->
                reactiveRedisTemplate.opsForValue()
                    .set(key, item, Duration.ofMinutes(5))
                    .thenReturn(item)
            )
    )
```

Use this when the cache must be shared across multiple service instances.

## Maven coordinates

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-data-redis-reactive</artifactId>
</dependency>
```

## application.yml

```yaml
spring:
  data:
    redis:
      host: localhost
      port: 6379
```
