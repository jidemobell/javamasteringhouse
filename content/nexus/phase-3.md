## Phase 3 — Concurrency & Collections

Multiple collectors writing to one topology map. The naive `HashMap` corrupts
under contention; `Collections.synchronizedMap` is correct but serializes
every reader. `ConcurrentHashMap` + the right *atomic* methods
(`computeIfAbsent`, `merge`, `compute`) is the answer.

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
    class M,C,Q,G done
    class T active
    class P,DB,K,X todo
```

> Brightly lit = **what this phase builds**. Dimmed = already in place. Outlined = coming up.

### What you'll build

```
manage/
├─ Topology.java       thread-safe container around ConcurrentHashMap
├─ Linker.java         thread-safe edge writes (no torn reads)
└─ Stats.java          snapshot counts without copying the world
```

### The contention picture

```mermaid
flowchart LR
    C1[CiscoCollector<br/>thread]
    C2[ServiceNowCollector<br/>thread]
    C3[SnmpCollector<br/>thread]
    P[Processor<br/>thread]
    M[(Topology<br/>ConcurrentHashMap)]
    C1 -->|upsert| M
    C2 -->|upsert| M
    C3 -->|upsert| M
    P -->|read snapshot| M
```

### The trap you're avoiding

```mermaid
sequenceDiagram
    participant T1 as Collector A
    participant T2 as Collector B
    participant Map as HashMap
    T1->>Map: containsKey("rtr-1")? false
    T2->>Map: containsKey("rtr-1")? false
    T1->>Map: put("rtr-1", vertexA)
    T2->>Map: put("rtr-1", vertexB)
    Note over Map: vertexA silently lost
```

`computeIfAbsent` collapses the check-then-act into one atomic call.
That's the whole game.

### Tasks in this phase

1. Build the race-free `Topology` map
2. Add safe edge linking — no lost writes when two threads link in parallel
3. Provide a `stats()` snapshot that doesn't block writers
