## Why raw `new Thread().start()` is a junior smell
- No bounded resource — 10k tasks = 10k OS threads = OOM.
- No reuse — paying thread-creation cost on every task.
- No naming, no uncaught-exception handling, no graceful shutdown.

### What to use instead
```java
ExecutorService pool = Executors.newFixedThreadPool(
    8,
    r -> {
        Thread t = new Thread(r, "collector-" + counter.incrementAndGet());
        t.setUncaughtExceptionHandler((th, ex) -> log.error("died", ex));
        return t;
    });

Future<TopologyDelta> f = pool.submit(new CollectorTask(device));
TopologyDelta d = f.get(30, TimeUnit.SECONDS); // bounded wait
```

### Picking the pool type
| Workload | Pool |
|---|---|
| CPU-bound (parsing, math) | `newFixedThreadPool(Runtime.getRuntime().availableProcessors())` |
| I/O-bound (network, DB) | Larger fixed pool, or `ThreadPoolExecutor` with bounded queue |
| Many short tasks | `newWorkStealingPool()` (ForkJoin under the hood) |
| Scheduled polling | `newScheduledThreadPool(n)` |

### Shutdown — do it properly
```java
pool.shutdown();                         // stop accepting new
if (!pool.awaitTermination(10, SECONDS)) // give in-flight a chance
    pool.shutdownNow();                  // interrupt the rest
```
