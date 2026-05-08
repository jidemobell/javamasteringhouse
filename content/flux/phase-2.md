# Phase 2 — Spring WebFlux Controllers

> You know how Mono and Flux behave. Now expose them over HTTP with
> annotated controllers and functional routes.

## Two programming models

Spring WebFlux supports both:

**Annotated controllers** — familiar `@RestController` / `@GetMapping` syntax,
but return types are `Mono<T>` or `Flux<T>` instead of `T`.

**Functional routing** — `RouterFunction<ServerResponse>` + `HandlerFunction`.
No annotations; pure Java, easy to compose and test in isolation.

Most teams start with annotated controllers and introduce functional routing
for complex route logic or when testing in isolation is painful.

## Key differences from Spring MVC

| | Spring MVC | WebFlux |
|---|---|---|
| Return type | `T` | `Mono<T>` / `Flux<T>` |
| Streaming | Hard | `Flux<T>` with `text/event-stream` |
| Blocking I/O in handler | OK | **Never** — blocks Netty threads |
| Test support | `MockMvc` | `WebTestClient` |

## Maven coordinates

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-test</artifactId>
  <scope>test</scope>
</dependency>
```
