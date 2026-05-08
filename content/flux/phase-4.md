# Phase 4 — Advanced Reactor Operators

> `map` and `filter` cover the basics. Real pipelines need concurrency control,
> backpressure, and composition across multiple sources.

## flatMap vs concatMap

Both flatten a `Flux<Publisher<T>>` into a `Flux<T>`, but with different ordering guarantees:

| | `flatMap` | `concatMap` |
|---|---|---|
| Order | Not preserved — subscribes eagerly | Preserved — subscribes sequentially |
| Concurrency | High (all inner publishers run at once) | Low (one at a time) |
| Use when | Parallel I/O calls (DB lookups, HTTP) | Order matters (dependent steps) |

```java
// flatMap: fetch all user profiles in parallel
Flux.fromIterable(userIds)
    .flatMap(id -> userService.fetchProfile(id))  // concurrent

// concatMap: process events in order
Flux.fromIterable(events)
    .concatMap(event -> processor.handle(event))  // sequential
```

## zip and merge

- `Flux.zip(a, b)` — combine pairs item-by-item; stops when either completes
- `Flux.merge(a, b)` — interleave two streams as they emit; both run concurrently
- `Mono.zip(a, b)` — wait for both Monos, combine their values

## Schedulers

Reactive pipelines run on whatever thread subscribes by default (Netty's event loop).
To offload blocking work:

```java
Mono.fromCallable(() -> blockingJdbcCall())
    .subscribeOn(Schedulers.boundedElastic())  // run on an I/O thread pool
```

`publishOn` switches the downstream execution thread; `subscribeOn` switches where
the source runs.
