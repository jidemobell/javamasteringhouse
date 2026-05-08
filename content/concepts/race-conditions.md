## What a race actually is

A race is **not** "things happening fast". It's *two threads reading and
writing the same field with no happens-before relationship between them*.

```java
// BROKEN: classic check-then-act race
if (!cache.containsKey(id)) {     // T1 sees absent
    cache.put(id, load(id));      // T2 also saw absent, also puts → double load
}
```

### Three honest fixes (pick one — don't stack them)

1. **Atomic operation**: `cache.computeIfAbsent(id, this::load)` — one call, no gap.
2. **Single mutator thread**: hand work to one thread via a queue. No shared write = no race.
3. **Lock the section**, but only the *minimum*: `synchronized` on a private final lock object, never on `this`.

### What `volatile` does and does not do
- ✅ Guarantees visibility of writes across threads.
- ❌ Does **not** make compound actions atomic. `volatile int x; x++;` is still racy.

### How to spot a race in code review
- A field that is read and written without a lock and isn't `final` or atomic.
- A "check then act" pattern (`containsKey` → `put`, `isPresent` → `set`).
- A collection that's iterated while another thread mutates it (`ConcurrentModificationException` is just the polite version).
