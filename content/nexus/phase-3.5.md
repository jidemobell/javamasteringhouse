## Phase 3.5 — ExecutorService

You probably wrote `new Thread(collector).start()` in Phase 3. Time to grow up.
Replace manual threads with a named, sized, properly-shutdown
`ExecutorService`. Bonus: scheduled re-runs every N seconds.

### Where this fits in the bigger picture

```mermaid
flowchart LR
    M["Phase 1<br/>Resource + Vertex"]
    C["Phase 2<br/>Collectors"]
    Q[("BlockingQueue")]
    G["Phase 2.5<br/>Graph + LinkPolicy"]
    T["Phase 3<br/>Topology Map"]
    P["Phase 3.5<br/>Thread Pool"]
    DB[("Phase 4<br/>Postgres")]
    K{{"Phase 5<br/>Kafka"}}
    X["Phase 6<br/>Merge"]
    M --> C --> Q --> G --> T --> DB
    P -.runs.-> C
    T --> K --> X
    DB --> X
    classDef done fill:#1e293b,stroke:#475569,color:#94a3b8
    classDef active fill:#0f766e,stroke:#22d3ee,color:#e0f2fe,stroke-width:3px
    classDef todo fill:#0b1020,stroke:#334155,color:#475569
    class M,C,Q,G,T done
    class P active
    class DB,K,X todo
```

> Brightly lit = **what this phase builds**. Dimmed = already in place. Outlined = coming up.

### What you'll build

```
runtime/
├─ CollectorRunner.java    owns a fixed pool, names threads, handles errors
├─ ScheduledRunner.java    reruns each collector every N seconds
└─ ShutdownHook.java       cooperative shutdown — drain or timeout
```

### Pool layout

```mermaid
flowchart LR
    subgraph Pool["FixedThreadPool size=4"]
        T1[collector-1]
        T2[collector-2]
        T3[collector-3]
        T4[collector-4]
    end
    Q[(submit queue)]
    Cs[CollectorRunner.run]
    Cs --> Q
    Q --> T1
    Q --> T2
    Q --> T3
    Q --> T4
```

### Shutdown sequence

```mermaid
sequenceDiagram
    participant App
    participant Pool as ExecutorService
    participant W as Worker thread
    App->>Pool: shutdown()
    Pool-->>W: stop accepting new tasks, drain in-flight
    App->>Pool: awaitTermination(10s)
    alt Done in time
        Pool-->>App: clean exit
    else Timed out
        App->>Pool: shutdownNow()
        Pool-->>W: interrupt
    end
```

### Tasks in this phase

1. Run all collectors on a fixed pool with named threads + an uncaught-exception handler
2. Schedule each collector to repeat every 30 seconds with backoff on failure
