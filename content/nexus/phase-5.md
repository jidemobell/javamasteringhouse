## Phase 5 — Kafka & Event-Driven

Every `upsert` becomes an event. Downstream services consume. You'll meet
partitioning by resource id, exactly-once-ish semantics with idempotent
producers, and the consumer-group rebalancing dance.

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
    class M,C,Q,G,T,P,DB done
    class K active
    class X todo
```

> Brightly lit = **what this phase builds**. Dimmed = already in place. Outlined = coming up.

### What you'll build

```
events/
├─ TopologyEventProducer.java   keyed publish, idempotence on
├─ TopologyEventConsumer.java   manual commit, at-least-once + idempotent sink
└─ RetryingHandler.java         pause+seek on transient downstream failure
```

### End-to-end flow

```mermaid
flowchart LR
    Coll[Collectors]
    Prod[TopologyEventProducer]
    K[(Kafka topic<br/>topology.input.resources<br/>partitions=8)]
    Cons[TopologyEventConsumer]
    Dao[ResourceDao.upsert]
    DB[(Postgres)]
    Coll --> Prod
    Prod -->|key=resourceId| K
    K --> Cons
    Cons --> Dao
    Dao --> DB
```

### Why key by resource id

Same key produces the same partition, which guarantees strict order per
resource. Without a key it is round-robin and you can re-order updates for
the same router. Two updates for `rtr-1` always land in the same partition
and reach the same consumer in order.

### At-least-once with manual commit

```mermaid
sequenceDiagram
    participant K as Kafka
    participant C as Consumer
    participant DB as Postgres
    C->>K: poll()
    K-->>C: batch of records
    C->>DB: UPSERT each (idempotent)
    alt all succeed
        C->>K: commitSync()
    else any throws
        Note over C: do NOT commit
        C->>K: next poll redelivers
    end
```

### Tasks in this phase

1. Build an idempotent producer keyed by resource id
2. Build an at-least-once consumer with manual commitSync
3. Handle transient downstream errors with pause + seek instead of crashing
