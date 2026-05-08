# Phase 1 — Reactive Foundations

> Before wiring a web layer, you need to think in reactive types.
> This phase introduces `Mono` and `Flux` — the two core types in Project Reactor —
> and the operators that transform them.

## Why reactive?

Traditional servlet threads block while waiting for I/O (DB query, HTTP call, Kafka read).
Under load, you run out of threads before you run out of CPU.

Spring WebFlux runs on Netty with a small fixed thread pool. Handlers return a
`Mono` or `Flux` — a *description* of work to do — rather than a result.
Netty subscribes, drives the pipeline, and reuses the thread for other requests
while I/O is pending.

| | Servlet (blocking) | WebFlux (reactive) |
|---|---|---|
| Thread per request | ✅ | ❌ |
| Scales with I/O load | ❌ | ✅ |
| Familiar mental model | ✅ | ❌ initially |

## Mono vs Flux

```
Mono<T>   — 0 or 1 items, then complete or error
Flux<T>   — 0 to N items, then complete or error
```

Both are **cold** by default — nothing happens until someone subscribes.

## Key operators

| Operator | Purpose |
|----------|---------|
| `map` | Transform each item synchronously |
| `flatMap` | Transform and return another Publisher (async) |
| `filter` | Drop items that don't match a predicate |
| `zipWith` | Combine two publishers item by item |
| `onErrorResume` | Recover from an error with a fallback publisher |
| `doOnNext` | Side-effect on each item (logging, metrics) |

## Maven coordinates

```xml
<parent>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-parent</artifactId>
  <version>3.3.0</version>
</parent>

<dependencies>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
  </dependency>
</dependencies>
```
