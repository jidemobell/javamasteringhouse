### Prerequisites

- JDK 17+
- 4 free CPU cores recommended (concurrency demos)

### Run it

```bash
cd nexus-phase-2
./gradlew run --args="--collectors=4 --duration=10s"
```

Watch the log: each collector thread should report independently, and the
shared `TopologyStore` should never throw `ConcurrentModificationException`.

### What to edit

- `src/main/java/collector/Collector.java` — the worker
- `src/main/java/store/TopologyStore.java` — the shared sink

### Useful

```bash
./gradlew test --tests "*ConcurrencyTest"
```
