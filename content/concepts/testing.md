## Testing — the part nobody actually teaches you

Most "intro to testing" material drowns you in tools (JUnit, Mockito, AssertJ,
Testcontainers, Cucumber, JaCoCo…) before answering the only questions that
matter: **what is a test, why am I writing one, and how do I know what to
assert?** This page answers those, in order, using examples from this very
project (`Resource`, `Vertex`, `Collector`).

By the end you should be able to look at any class and write a meaningful
test for it without copying someone else's template.

---

## 1. Why we test (the honest answer)

Most people will tell you "to find bugs." That's wrong, or at least
incomplete. Tests find bugs by accident. Their **real job** is:

> **Tests freeze decisions.**
>
> Every test you write says: *"This behavior is non-negotiable. If a future
> change breaks it — including a future change written by me, on a Tuesday,
> at 4pm — the build will tell me."*

That single reframe changes everything:

- You stop testing "the code." You start testing **the contract**.
- You stop asking "is this 100% covered?" You start asking **"have I frozen
  every decision that matters?"**
- You stop feeling like tests are a tax. They become **the place your design
  lives.**

A second job worth naming:

> **Tests are executable documentation.**
>
> If someone deleted `Resource.java` and you only had `ResourceContractTest`,
> you should be able to rebuild `Resource` from the test. That's the bar.

If a test doesn't freeze a decision *and* doesn't document behavior, delete
it.

---

## 2. The two flavors of contracts

Almost every test you'll ever write falls into one of two buckets. Knowing
which bucket you're in tells you what to assert.

### Structural contract — "it *has* these things"

The class is mostly data. You're asserting on **state**.

```java
Resource r = new Resource("router-1", "cisco-device");
assertEquals("router-1", r.id());
assertEquals("cisco-device", r.type());
```

This is `ResourceContractTest`. Easy to write, because the contract is just
"this thing exists, has these fields, refuses null/empty."

### Behavioral contract — "it *does* these things"

The class has logic. You're asserting on **outcomes and interactions**.

```java
// "A CiscoCollector accepts cisco resources and rejects others."
collector.collect(ciscoResource);   // succeeds
assertThrows(IllegalArgumentException.class,
    () -> collector.collect(linuxResource));
```

This is `CollectorContractTest`. Harder to write — not because the syntax is
harder, but because **you have to decide the behavior first.** The discomfort
you feel writing it is the design pressure doing its job.

> **Tip:** If you can't write a behavioral test, you don't know what your
> class does yet. That's a design problem, not a testing problem.

---

## 3. Test-first vs test-after — both are valid

There's a religious war in the industry about this. Ignore it. The truth is
simple:

| Situation | Write the test... |
|---|---|
| Fuzzy requirements, complex domain rules | **Before** (TDD) |
| Bug fix | **Before** — write the failing test that reproduces the bug |
| Refactoring legacy code | **Before** — pin current behavior, then refactor |
| Public API others will consume | **Before** |
| Clear, well-understood logic (a formatter, a parser) | **After** is fine |
| Throwaway script, prototype | Often not at all |

What matters is **the test exists by the time you commit**, and **it
describes behavior, not implementation**.

> **The trap of test-after:** you mirror what the code happens to do instead
> of what it *should* do. You lock in the bug. Always ask "what is the
> contract?" — never "what does the code currently produce?"

---

## 4. The universal skeleton: Given / When / Then

Every test, in any language, in any framework, fits this shape:

```
Given  some starting state
When   I do this action
Then   I expect this outcome
```

In code we usually call it **Arrange / Act / Assert** (AAA), same idea:

```java
@Test
void rejects_empty_id() {
    // Arrange — nothing to set up
    // Act + Assert
    assertThrows(IllegalArgumentException.class,
        () -> new Resource("", "cisco-device"));
}

@Test
void links_two_vertices_of_the_same_resource_type() {
    // Arrange
    Vertex<CiscoResource> a = new Vertex<>("v1", new CiscoResource("r1"));
    Vertex<CiscoResource> b = new Vertex<>("v2", new CiscoResource("r2"));
    Graph graph = new Graph();
    graph.add(a); graph.add(b);

    // Act
    graph.connect(a, b);

    // Assert
    assertTrue(graph.neighbors(a).contains(b));
}
```

If your test doesn't fit AAA, it's usually doing too much. Split it.

> **Name your tests like sentences.** `rejects_empty_id` reads better than
> `testResource1`. The test name *is* the spec line.

---

## 5. What to test (and what NOT to test)

This is where most people waste time.

### Test
- The contract you publish to other code (public API, return types, exceptions).
- Edge cases at the boundary (empty, null, max, negative, off-by-one).
- Branching logic (every `if` should have at least one test per branch).
- Behavior that, if broken, would be hard to detect later (silent corruption).
- Bugs you've fixed (the test stays as a regression net).

### Don't test
- **Private methods directly.** Test them through the public API. If a
  private method is so complex it needs its own test, it probably wants to
  be a public method on a smaller class.
- **The framework or language.** Don't test that Jackson serializes JSON.
  Don't test that `ArrayList.add` works. That's their job.
- **Trivial getters/setters.** They have no behavior to freeze.
- **Implementation details.** "I expect this method to call that method
  twice" is usually a smell — see Mocks below.
- **Random / time / network** without controlling them. Inject a `Clock`,
  stub the random, mock the HTTP client. Otherwise the test is flaky.

> **The mirror question:** *If I rewrote the implementation completely
> differently, would my test still pass?* If no, you're testing the
> implementation, not the contract. Rewrite the test.

---

## 6. Test doubles — pick the lightest one that works

A "test double" is anything you substitute for a real collaborator in a test.
There are five names you'll hear, in order of "fanciness":

| Name | What it does | When to use |
|---|---|---|
| **Dummy** | Object passed but never used (just to satisfy a parameter). | When you need a non-null arg you don't care about. |
| **Fake** | A real, working alternative — usually in-memory. (e.g. `HashMap` instead of a real DB.) | Most tests. Cheapest, most readable. |
| **Stub** | Returns canned answers when called. | When you only care about output, not interaction. |
| **Mock** | A stub that **also verifies it was called correctly**. | When the *interaction itself* is the contract (rare). |
| **Spy** | A real object that records calls. | Almost never. If you reach for one, reconsider. |

### The mock trap

Beginners over-mock. They write:

```java
verify(producer).send("topic", message);   // <-- testing the implementation
```

…and then any refactor breaks the test even when the behavior is unchanged.

**Heuristic:** prefer **fakes** to mocks. Use a mock only when the *fact that
the call happened* is part of the contract you're freezing — e.g., "an
unhealthy collector must publish a `CollectorFailed` event." There, the
publication *is* the behavior.

### A quick example

You're testing `Collector.collect()` which writes to a queue.

- **Bad:** mock the queue, verify `queue.put(...)` was called.
- **Good:** use a real `LinkedBlockingQueue`, run `collect()`, then assert
  `queue.poll()` returns the expected item.

The "good" version survives any refactor that still ends up putting the
right thing in the queue.

---

## 7. The test pyramid (briefly, because it's overhyped)

```
          ╱  e2e   ╲       few, slow, brittle, high confidence
         ╱──────────╲
        ╱ integration╲     some, medium speed, focused on seams
       ╱──────────────╲
      ╱     unit       ╲   many, fast, focused on single classes
     ╱──────────────────╲
```

- **Unit** — one class at a time, no I/O, milliseconds. Most of your tests
  live here. `ResourceContractTest`, `VertexContractTest`,
  `CollectorContractTest` are unit tests.
- **Integration** — several classes wired together, possibly with a real
  database / Kafka / HTTP. Slower. Use to verify *seams*: serialization,
  SQL, message formats, framework wiring (Dropwizard healthchecks!).
- **End-to-end** — the whole system. Expensive, flaky, but irreplaceable
  for "does the user-visible feature actually work?"

> **The pyramid is about *count*, not *importance*.** A single end-to-end
> test that catches "we accidentally swapped two columns in production"
> can be worth a thousand unit tests. Just don't have a thousand of them.

---

## 8. Anti-patterns that bite (in order of frequency)

### "Testing the code, not the contract"
The test passes only because of *how* the code is written. Refactor →
red. Symptom: lots of `verify(...)` calls.

### Tests that always pass
A test with no failing case. Common after rushed test-after work.
**Sanity check:** before you trust a green test, deliberately break the
production code and confirm the test goes red. If it doesn't, the test
is decoration.

### Shared mutable state between tests
Test A leaves a static field set, Test B passes only when run after A.
Run order should be irrelevant. JUnit gives you `@BeforeEach` for a
reason — use it instead of static fixtures.

### One giant `testEverything()` method
500 lines, 30 assertions, one test method. When it fails you have no
idea what broke. Split into one behavior per method. Each test name
should describe a single sentence of the spec.

### Snapshot-only tests
"The output of `toJson()` matches this 200-line blob." Useful for
serialization regression, but tells you nothing about *why* the output
should look that way. Pair with a real behavioral test.

### Time, randomness, network
`Thread.sleep(100)` in a test. `Instant.now()` inside production code.
`new Random()` with no seed. All flake. Inject a `Clock`, a `Random`, a
`HttpClient`. The tests stop being flaky and your code becomes more
testable as a free side effect.

### 100% coverage worship
Coverage measures lines executed, not decisions frozen. You can have
100% coverage and zero assertions. Aim for **decision coverage** in
your head, not line coverage in a tool.

---

## 9. Concurrency tests are different (a heads-up)

When the code is multi-threaded, all the rules above still apply, but
"the test is green once" no longer means "it works." A race condition
appears in 1 of 10,000 runs. The standard tricks:

- **Repeat the test in a loop** (`@RepeatedTest(1000)`).
- **Maximize contention** — many threads, tight loops, `CountDownLatch` to
  release them at the same instant.
- **Specialized tools** — JCStress for serious cases.
- **Inject a deterministic schedule** — `ExecutorService` you can step.

See the *Race Conditions* and *Deadlocks* concepts for the failure
modes you're hunting.

---

## 10. How this all maps to the Nexus project

The contract tests you've already met are concrete instances of the
ideas on this page:

| Test | Bucket | Decisions it freezes |
|---|---|---|
| `ResourceContractTest` | Structural | "A resource is a template with an id and a type. Both required, both non-null." |
| `VertexContractTest` | Structural + tiny behavioral | "A vertex holds exactly one Resource. Generic over the resource type. Equality by id." |
| `CollectorContractTest` | Behavioral | "A collector reports its supported type, accepts matching resources, rejects others." |
| `GraphContractTest` (later) | Behavioral | "A graph holds vertices and edges. Same-type edges free; cross-type edges require a policy." |

Notice the progression: as the abstraction climbs (Resource → Vertex →
Collector → Graph), the contract shifts from structural to behavioral,
and the tests get more interesting. That's not an accident — that's
your design layering up.

---

## 11. The first test you'll ever write — a walkthrough

You've been handed a new class to build. Don't panic. Run this loop:

1. **Write the contract in English first.** Three to seven bullets. *"A
   `Foo` does X. It rejects Y. It is immutable. Equality is by Z."* If
   you can't, you don't understand the requirement yet — go ask.
2. **Pick the easiest bullet.** Usually a structural one. Write that
   single test. It won't compile (the class doesn't exist) — that's
   fine, that's the *Red* of TDD.
3. **Make it compile, then make it pass.** Minimum code. Don't add
   behavior the test doesn't demand.
4. **Pick the next bullet.** Repeat.
5. **When all bullets are tests, look at the class.** It exists, it
   works, and the contract is locked in. Refactor freely — the tests
   will catch you if you slip.

That loop is TDD in one paragraph.

---

## 12. The mental checklist (print this in your head)

Before you write a test, ask:
- [ ] What **decision** am I freezing? Can I say it in one sentence?
- [ ] Am I testing **behavior** or **implementation**?
- [ ] Does my test name read as a **sentence of the spec**?
- [ ] Did I cover the **boundary cases** (null, empty, max, negative)?
- [ ] If someone deletes the production code, does my test tell them
      how to rebuild it?

Before you commit, ask:
- [ ] Did I see this test go **red** at least once? (Otherwise it might
      be decoration.)
- [ ] Would my test still pass if I rewrote the implementation
      differently? (If no, I'm testing the wrong thing.)
- [ ] Is anything **time/random/network** dependent? Did I control it?

That's it. That's testing.
