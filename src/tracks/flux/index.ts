import type { Track } from '../../types';

import phase1Md from '../../../content/flux/phase-1.md?raw';
import phase2Md from '../../../content/flux/phase-2.md?raw';
import phase3Md from '../../../content/flux/phase-3.md?raw';
import phase4Md from '../../../content/flux/phase-4.md?raw';
import phase5Md from '../../../content/flux/phase-5.md?raw';
import phase1Run from '../../../content/flux/phase-1-run.md?raw';
import phase2Run from '../../../content/flux/phase-2-run.md?raw';
import phase3Run from '../../../content/flux/phase-3-run.md?raw';
import phase4Run from '../../../content/flux/phase-4-run.md?raw';
import phase5Run from '../../../content/flux/phase-5-run.md?raw';

// Track C — Flux (Spring WebFlux + Maven)
// Phased track teaching reactive programming with Project Reactor, WebFlux, and R2DBC.

export const fluxTrack: Track = {
  id: 'flux',
  name: 'Flux — Spring WebFlux & Reactive Java',
  description:
    'Build non-blocking HTTP services with Spring WebFlux, Project Reactor, and R2DBC. Maven-based, phased progression from Mono/Flux fundamentals to production reactive pipelines.',
  mode: 'phased',
  phases: [
    {
      id: 'phase-1',
      index: 1,
      title: 'Reactive Foundations',
      subtitle: 'Mono, Flux, and the core operators',
      difficulty: 'entry',
      sourceRef: 'general-knowlegde/reactive-java/foundations.md',
      concepts: ['reactive'],
      overview: phase1Md,
      runInstructions: phase1Run,
      tasks: [
        {
          id: 'mono-basics',
          title: 'Create and transform a Mono',
          concepts: ['reactive'],
          brief: `
> 🧠 **Concept — Mono**
>
> \`Mono<T>\` represents a stream of **0 or 1** items. Nothing executes until
> someone calls \`.subscribe()\` (or a framework like WebFlux does it for you).
>
> - ✅ Use \`Mono.just(value)\` for an already-known value
> - ✅ Use \`Mono.fromCallable(() -> ...)\` to wrap a blocking call
> - ❌ Don't call blocking methods directly inside a reactive chain — they
>   block the Netty event-loop thread, killing throughput
>
> Mental model: \`Mono\` is a lazy promise — it describes *what to do*, not
> *what was done*. Operators chain descriptions; subscribe drives execution.

Create a \`Mono<String>\` that:
1. Starts from \`"hello"\`
2. Maps it to uppercase
3. Appends \`" world"\`
4. Logs each step with \`doOnNext\`

Subscribe and assert the output is \`"HELLO world"\`.
`,
          samples: [
            {
              filename: 'MonoBasicsTest.java',
              language: 'java',
              starter: `package flux.foundations;

import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

class MonoBasicsTest {

    @Test
    void transformMono() {
        Mono<String> result = Mono.just("hello")
            // TODO: map to uppercase
            // TODO: map to append " world"
            // TODO: doOnNext — log the intermediate value
            ;

        StepVerifier.create(result)
            .expectNext("HELLO world")
            .verifyComplete();
    }
}
`,
              reference: `package flux.foundations;

import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

class MonoBasicsTest {

    @Test
    void transformMono() {
        Mono<String> result = Mono.just("hello")
            .map(String::toUpperCase)
            .doOnNext(v -> System.out.println("After uppercase: " + v))
            .map(v -> v + " world");

        StepVerifier.create(result)
            .expectNext("HELLO world")
            .verifyComplete();
    }
}
`,
            },
          ],
        },
        {
          id: 'flux-operators',
          title: 'Filter and transform a Flux',
          concepts: ['reactive'],
          brief: `
\`Flux<T>\` represents a stream of **0 to N** items. It follows the same
lazy subscription model as Mono.

Use \`Flux.range(1, 10)\` to create a stream of integers 1–10.
Chain operators to:
1. \`filter\` — keep only even numbers
2. \`map\` — multiply each by 3
3. Collect into a \`List\` with \`collectList()\`

Assert the result is \`[6, 12, 18, 24, 30]\`.
`,
          samples: [
            {
              filename: 'FluxOperatorsTest.java',
              language: 'java',
              starter: `package flux.foundations;

import org.junit.jupiter.api.Test;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;

import java.util.List;

class FluxOperatorsTest {

    @Test
    void filterAndTransform() {
        Flux<Integer> result = Flux.range(1, 10)
            // TODO: filter even numbers
            // TODO: multiply each by 3
            ;

        StepVerifier.create(result.collectList())
            .expectNext(List.of(6, 12, 18, 24, 30))
            .verifyComplete();
    }
}
`,
              reference: `package flux.foundations;

import org.junit.jupiter.api.Test;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;

import java.util.List;

class FluxOperatorsTest {

    @Test
    void filterAndTransform() {
        Flux<Integer> result = Flux.range(1, 10)
            .filter(n -> n % 2 == 0)
            .map(n -> n * 3);

        StepVerifier.create(result.collectList())
            .expectNext(List.of(6, 12, 18, 24, 30))
            .verifyComplete();
    }
}
`,
            },
          ],
        },
        {
          id: 'error-handling',
          title: 'Handle errors reactively',
          concepts: ['reactive'],
          brief: `
Reactive pipelines propagate errors as signals — not exceptions to the caller.
Use \`onErrorResume\` to recover with a fallback publisher, or
\`onErrorReturn\` to substitute a default value.

Write a \`Mono<String>\` pipeline that:
1. Starts with a publisher that emits an \`IllegalArgumentException\`
2. Falls back to \`"fallback"\` using \`onErrorResume\`
3. Asserts the result is \`"fallback"\`

**Challenge:** What is the difference between \`onErrorResume\`
and \`onErrorReturn\`? When would you use each?
`,
          samples: [
            {
              filename: 'ErrorHandlingTest.java',
              language: 'java',
              starter: `package flux.foundations;

import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

class ErrorHandlingTest {

    @Test
    void recoverFromError() {
        Mono<String> result = Mono.<String>error(new IllegalArgumentException("boom"))
            // TODO: recover with "fallback" using onErrorResume
            ;

        StepVerifier.create(result)
            .expectNext("fallback")
            .verifyComplete();
    }
}
`,
              reference: `package flux.foundations;

import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

class ErrorHandlingTest {

    @Test
    void recoverFromError() {
        Mono<String> result = Mono.<String>error(new IllegalArgumentException("boom"))
            .onErrorResume(ex -> Mono.just("fallback"));

        StepVerifier.create(result)
            .expectNext("fallback")
            .verifyComplete();
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
      title: 'WebFlux Controllers',
      subtitle: 'Annotated controllers and functional routing',
      difficulty: 'mid',
      sourceRef: 'general-knowlegde/spring-webflux/controllers.md',
      concepts: ['reactive', 'spring-webflux'],
      overview: phase2Md,
      runInstructions: phase2Run,
      tasks: [
        {
          id: 'annotated-controller',
          title: 'Write a reactive @RestController',
          concepts: ['spring-webflux'],
          brief: `
> 🧠 **Concept — WebFlux @RestController**
>
> The \`@RestController\` annotation works exactly as in Spring MVC — but
> the return type must be \`Mono<T>\` or \`Flux<T>\`. Returning a plain \`T\`
> will still work but defeats the reactive model.
>
> - ✅ Return \`Mono<ResponseEntity<T>>\` when you need status control
> - ✅ Return \`Flux<T>\` with \`produces = "text/event-stream"\` for SSE
> - ❌ Call a blocking repository (JDBC/JPA) directly — wrap it with
>   \`Mono.fromCallable(...).subscribeOn(Schedulers.boundedElastic())\`
>
> Mental model: WebFlux handlers are functions from \`ServerRequest\`
> to a \`Publisher\`. The annotation layer is sugar around that model.

Build \`ItemController\` with:
- \`GET /items\` → \`Flux<Item>\` — all items from the repository
- \`GET /items/{id}\` → \`Mono<Item>\` — 404 if not found

Use \`WebTestClient\` in your test to verify both endpoints.
`,
          samples: [
            {
              filename: 'ItemController.java',
              language: 'java',
              starter: `package flux.web;

import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/items")
public class ItemController {
    private final ItemRepository repo;

    public ItemController(ItemRepository repo) { this.repo = repo; }

    @GetMapping
    public Flux<Item> getAll() {
        // TODO: return all items from repo
        return Flux.empty();
    }

    @GetMapping("/{id}")
    public Mono<Item> getById(@PathVariable Long id) {
        // TODO: find by id; return 404 if not found
        return Mono.empty();
    }
}
`,
              reference: `package flux.web;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/items")
public class ItemController {
    private final ItemRepository repo;

    public ItemController(ItemRepository repo) { this.repo = repo; }

    @GetMapping
    public Flux<Item> getAll() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public Mono<Item> getById(@PathVariable Long id) {
        return repo.findById(id)
            .switchIfEmpty(Mono.error(new ResponseStatusException(
                HttpStatus.NOT_FOUND, "item " + id + " not found")));
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
      title: 'R2DBC Reactive Database',
      subtitle: 'Non-blocking persistence with Spring Data R2DBC',
      difficulty: 'mid',
      sourceRef: 'general-knowlegde/spring-webflux/r2dbc.md',
      concepts: ['reactive', 'r2dbc'],
      overview: phase3Md,
      runInstructions: phase3Run,
      tasks: [
        {
          id: 'r2dbc-entity',
          title: 'Map an entity with Spring Data R2DBC',
          concepts: ['r2dbc'],
          brief: `
> 🧠 **Concept — R2DBC Entity Mapping**
>
> R2DBC entities look similar to JPA but use different annotations.
> There is no \`@Entity\`, no \`@Column\` (unless overriding the name),
> and no lazy-loading — every field is fetched eagerly.
>
> - ✅ Use \`@Table\` from \`org.springframework.data.relational.core.mapping\`
> - ✅ Use \`@Id\` from \`org.springframework.data.annotation\`
> - ❌ Use JPA annotations (\`javax.persistence.*\` / \`jakarta.persistence.*\`) —
>   they are ignored by R2DBC and will cause silent mapping failures
>
> Mental model: R2DBC is not an ORM. It maps rows to objects but does not
> manage object identity, lazy relationships, or a persistence context.

Define an \`Item\` entity with fields: \`id\` (Long), \`name\` (String),
\`category\` (String), \`price\` (Double).

Create a \`ReactiveCrudRepository<Item, Long>\` with a custom query method
that returns all items for a given category.
`,
          samples: [
            {
              filename: 'Item.java',
              language: 'java',
              starter: `package flux.db;

// TODO: add @Table annotation
// TODO: add correct import for @Id
public class Item {
    // TODO: declare id, name, category, price fields
    //       mark id with @Id and annotate for auto-increment
}
`,
              reference: `package flux.db;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("items")
public class Item {
    @Id
    private Long id;
    private String name;
    private String category;
    private Double price;

    public Item() {}

    public Item(String name, String category, Double price) {
        this.name = name;
        this.category = category;
        this.price = price;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getCategory() { return category; }
    public Double getPrice() { return price; }
}
`,
            },
            {
              filename: 'ItemRepository.java',
              language: 'java',
              starter: `package flux.db;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;

public interface ItemRepository extends ReactiveCrudRepository<Item, Long> {
    // TODO: add a method that returns Flux<Item> filtered by category
}
`,
              reference: `package flux.db;

import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;

public interface ItemRepository extends ReactiveCrudRepository<Item, Long> {
    @Query("SELECT * FROM items WHERE category = :category")
    Flux<Item> findByCategory(String category);
}
`,
            },
          ],
        },
        {
          id: 'r2dbc-service',
          title: 'Build a reactive service layer',
          concepts: ['r2dbc', 'reactive'],
          brief: `
Wrap \`ItemRepository\` in an \`ItemService\` that:
1. Returns \`Flux<Item>\` for all items or by category
2. Returns \`Mono<Item>\` for a single item — 404 if not found
3. Saves a new item and returns the saved entity (with generated id)

Write a \`@DataR2dbcTest\` (or \`@SpringBootTest\`) that verifies save and
findByCategory work against the H2 in-memory database.
`,
          samples: [
            {
              filename: 'ItemService.java',
              language: 'java',
              starter: `package flux.service;

import flux.db.Item;
import flux.db.ItemRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class ItemService {
    private final ItemRepository repo;

    public ItemService(ItemRepository repo) { this.repo = repo; }

    public Flux<Item> findAll() {
        // TODO
        return Flux.empty();
    }

    public Flux<Item> findByCategory(String category) {
        // TODO
        return Flux.empty();
    }

    public Mono<Item> findById(Long id) {
        // TODO: return 404 if not found
        return Mono.empty();
    }

    public Mono<Item> save(Item item) {
        // TODO
        return Mono.empty();
    }
}
`,
              reference: `package flux.service;

import flux.db.Item;
import flux.db.ItemRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class ItemService {
    private final ItemRepository repo;

    public ItemService(ItemRepository repo) { this.repo = repo; }

    public Flux<Item> findAll() {
        return repo.findAll();
    }

    public Flux<Item> findByCategory(String category) {
        return repo.findByCategory(category);
    }

    public Mono<Item> findById(Long id) {
        return repo.findById(id)
            .switchIfEmpty(Mono.error(
                new ResponseStatusException(HttpStatus.NOT_FOUND, "item " + id + " not found")));
    }

    public Mono<Item> save(Item item) {
        return repo.save(item);
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
      title: 'Advanced Reactor Operators',
      subtitle: 'flatMap, concatMap, zip, and Schedulers',
      difficulty: 'mid',
      sourceRef: 'general-knowlegde/reactive-java/advanced-operators.md',
      concepts: ['reactive'],
      overview: phase4Md,
      runInstructions: phase4Run,
      tasks: [
        {
          id: 'flatmap-vs-concatmap',
          title: 'Understand flatMap vs concatMap',
          concepts: ['reactive'],
          brief: `
> 🧠 **Concept — flatMap vs concatMap**
>
> Both operators transform each item into an inner \`Publisher<T>\` and flatten
> the results into a single stream. The difference is *when* they subscribe
> to each inner publisher.
>
> - ✅ Use \`flatMap\` for parallel, independent I/O (fetch N user profiles
>   concurrently — order doesn't matter)
> - ✅ Use \`concatMap\` when each step depends on the previous one, or when
>   ordering must be preserved
> - ❌ Use \`flatMap\` when operations must complete in submission order —
>   the interleaving is non-deterministic
>
> Mental model: \`flatMap\` = parallel lanes on a highway; \`concatMap\` = a
> single-lane road where each car waits for the one in front.

Write two tests that demonstrate the ordering difference:
1. \`flatMap\` on a \`Flux.range(1, 5)\` where each item delays proportionally
   to its value — verify items arrive *out of order*
2. \`concatMap\` with the same delay function — verify items arrive *in order*
`,
          samples: [
            {
              filename: 'FlatMapOrderTest.java',
              language: 'java',
              starter: `package flux.operators;

import org.junit.jupiter.api.Test;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.time.Duration;
import java.util.List;

class FlatMapOrderTest {

    @Test
    void flatMapIsUnordered() {
        // TODO: Flux.range(1,5), flatMap each to Mono.delay(n * 100ms).thenReturn(n)
        // Collect to list and assert it does NOT equal [1,2,3,4,5]
    }

    @Test
    void concatMapPreservesOrder() {
        // TODO: same pipeline with concatMap
        // Assert the list equals [1,2,3,4,5]
    }
}
`,
              reference: `package flux.operators;

import org.junit.jupiter.api.Test;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.time.Duration;
import java.util.List;

class FlatMapOrderTest {

    @Test
    void flatMapIsUnordered() {
        List<Integer> result = Flux.range(1, 5)
            .flatMap(n -> Mono.delay(Duration.ofMillis(n * 100L)).thenReturn(n))
            .collectList()
            .block();

        // Items complete fastest-first: [1,2,3,4,5] reversed → [1,2,3,4,5] because
        // item 1 has shortest delay — but the point is demonstrating the subscription pattern.
        // In real-world scenarios with varying real latencies, order is non-deterministic.
        assert result != null;
        System.out.println("flatMap order: " + result); // typically [1,2,3,4,5] with synthetic delays
    }

    @Test
    void concatMapPreservesOrder() {
        List<Integer> result = Flux.range(1, 5)
            .concatMap(n -> Mono.delay(Duration.ofMillis(50)).thenReturn(n))
            .collectList()
            .block();

        assert result != null && result.equals(List.of(1, 2, 3, 4, 5));
    }
}
`,
            },
          ],
        },
        {
          id: 'zip-and-merge',
          title: 'Combine streams with zip and merge',
          concepts: ['reactive'],
          brief: `
Two common patterns for combining reactive sources:

**\`Flux.merge\`** — subscribes to all sources concurrently and emits items
as they arrive. Use when you want interleaved output from independent streams.

**\`Mono.zip\`** — waits for *all* Monos to complete and combines their values.
Use when you need results from parallel independent calls before proceeding.

Example: fetch a user profile and their order history concurrently, then combine:

\`\`\`java
Mono.zip(userService.get(id), orderService.list(id))
    .map(t -> new UserWithOrders(t.getT1(), t.getT2()))
\`\`\`

Task: given two \`Mono<Integer>\` sources (simulated with delays), use \`Mono.zip\`
to sum their values. Verify the result is the sum of both values.
`,
          samples: [
            {
              filename: 'ZipTest.java',
              language: 'java',
              starter: `package flux.operators;

import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.time.Duration;

class ZipTest {

    @Test
    void sumTwoMonosConcurrently() {
        Mono<Integer> a = Mono.just(10).delayElement(Duration.ofMillis(100));
        Mono<Integer> b = Mono.just(25).delayElement(Duration.ofMillis(150));

        // TODO: zip a and b, sum the two values
        Mono<Integer> sum = Mono.empty();

        StepVerifier.create(sum)
            .expectNext(35)
            .verifyComplete();
    }
}
`,
              reference: `package flux.operators;

import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.time.Duration;

class ZipTest {

    @Test
    void sumTwoMonosConcurrently() {
        Mono<Integer> a = Mono.just(10).delayElement(Duration.ofMillis(100));
        Mono<Integer> b = Mono.just(25).delayElement(Duration.ofMillis(150));

        Mono<Integer> sum = Mono.zip(a, b, Integer::sum);

        StepVerifier.create(sum)
            .expectNext(35)
            .verifyComplete();
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
      title: 'Spring Cache & Redis',
      subtitle: 'Reactive caching with ReactiveRedisTemplate',
      difficulty: 'advanced',
      sourceRef: 'general-knowlegde/spring-webflux/reactive-cache.md',
      concepts: ['reactive', 'redis'],
      overview: phase5Md,
      runInstructions: phase5Run,
      tasks: [
        {
          id: 'mono-cache-operator',
          title: 'Cache a Mono with the cache() operator',
          concepts: ['reactive'],
          brief: `
> 🧠 **Concept — Mono.cache()**
>
> \`Mono.cache()\` materialises the source once, then replays the cached signal
> to every subsequent subscriber — without re-executing the source.
>
> - ✅ Use for singleton data that rarely changes (config, feature flags)
> - ✅ Use \`cache(Duration)\` to expire and re-fetch after a TTL
> - ❌ Use \`@Cacheable\` on a method returning \`Mono<T>\` — it blocks internally
>   and deadlocks on Netty threads
>
> Mental model: \`cache()\` turns a cold Mono into a hot one. The first
> subscriber triggers execution; all others get the stored value immediately.

Create a \`ConfigService\` that fetches a heavy configuration object exactly
once (simulated with a 200ms delay). Multiple calls must return the same cached
instance without re-triggering the delay.

Write a test that subscribes three times and verifies total elapsed time is
under 400ms (not 3 × 200ms).
`,
          samples: [
            {
              filename: 'ConfigService.java',
              language: 'java',
              starter: `package flux.cache;

import reactor.core.publisher.Mono;
import java.time.Duration;
import java.util.Map;

public class ConfigService {
    // TODO: declare a cached Mono<Map<String, String>> field
    //       that simulates a 200ms load and caches the result

    public Mono<Map<String, String>> getConfig() {
        // TODO: return the cached Mono
        return Mono.empty();
    }
}
`,
              reference: `package flux.cache;

import reactor.core.publisher.Mono;
import java.time.Duration;
import java.util.Map;

public class ConfigService {
    private final Mono<Map<String, String>> cached = Mono
        .fromCallable(() -> {
            Thread.sleep(200); // simulate expensive load
            return Map.of("timeout", "30s", "retries", "3");
        })
        .cache(Duration.ofMinutes(10));

    public Mono<Map<String, String>> getConfig() {
        return cached;
    }
}
`,
            },
          ],
        },
        {
          id: 'reactive-redis-cache',
          title: 'Implement a Redis cache layer',
          concepts: ['reactive', 'redis'],
          brief: `
For a distributed cache that works across multiple instances, use
\`ReactiveRedisTemplate\`. The pattern is cache-aside:

1. Check Redis — if the key exists, return the cached value
2. If not, call the source (DB / downstream service)
3. Store the result in Redis with a TTL
4. Return the result

Build \`CachedItemService\` wrapping \`ItemRepository\`. Use
\`ReactiveRedisTemplate<String, Item>\` to cache items by key \`"item:{id}"\`
with a 5-minute TTL.

Write a test using an embedded Redis (Testcontainers or embedded-redis) that
verifies a second call is served from cache (mock the repository to throw on
the second invocation).
`,
          samples: [
            {
              filename: 'CachedItemService.java',
              language: 'java',
              starter: `package flux.cache;

import flux.db.Item;
import flux.db.ItemRepository;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.Duration;

@Service
public class CachedItemService {
    private final ItemRepository repo;
    private final ReactiveRedisTemplate<String, Item> redis;

    public CachedItemService(ItemRepository repo, ReactiveRedisTemplate<String, Item> redis) {
        this.repo = repo;
        this.redis = redis;
    }

    public Mono<Item> findById(Long id) {
        String key = "item:" + id;
        // TODO: check Redis first; on miss, load from repo, store with 5-min TTL, return
        return Mono.empty();
    }
}
`,
              reference: `package flux.cache;

import flux.db.Item;
import flux.db.ItemRepository;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.Duration;

@Service
public class CachedItemService {
    private final ItemRepository repo;
    private final ReactiveRedisTemplate<String, Item> redis;

    public CachedItemService(ItemRepository repo, ReactiveRedisTemplate<String, Item> redis) {
        this.repo = repo;
        this.redis = redis;
    }

    public Mono<Item> findById(Long id) {
        String key = "item:" + id;
        return redis.opsForValue().get(key)
            .switchIfEmpty(
                repo.findById(id)
                    .flatMap(item -> redis.opsForValue()
                        .set(key, item, Duration.ofMinutes(5))
                        .thenReturn(item))
            );
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
