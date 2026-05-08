## Phase 6 — Merge & Composite Resources

Cisco says router R-42 has IP 10.0.0.1; ServiceNow says it's owned by team
"NetEng". Both true, both partial. Merge into one composite vertex with
provenance tracking. Watch for deadlocks when merging across two locked
vertices.

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
    class M,C,Q,G,T,P,DB,K done
    class X active
```

> Brightly lit = **what this phase builds**. Dimmed = already in place from earlier phases. You finish the picture in this phase.

### What you'll build

```
merge/
├─ MergeStrategy.java       interface — matches() + merge()
├─ IpBasedMerge.java        matches by exact IP
├─ NameBasedMerge.java      matches by hostname (looser)
├─ CompositeResource.java   union with provenance per attribute
└─ MergeEngine.java         global lock-ordering, no deadlocks
```

### What "merge" actually does

```mermaid
flowchart LR
    A["CiscoDevice<br/>id=cisco-rtr-1<br/>ip=10.0.0.1<br/>os=IOS-XE"]
    B["ServiceNowRecord<br/>sysId=sn-42<br/>ip=10.0.0.1<br/>owner=NetEng"]
    C["CompositeResource<br/>ip=10.0.0.1 (cisco,snow)<br/>os=IOS-XE (cisco)<br/>owner=NetEng (snow)"]
    A -->|IpBasedMerge.matches=true| C
    B -->|IpBasedMerge.matches=true| C
```

### The deadlock you're avoiding

```mermaid
sequenceDiagram
    participant T1 as Merge thread A
    participant T2 as Merge thread B
    participant V1 as Vertex(rtr-1)
    participant V2 as Vertex(rtr-2)
    T1->>V1: lock
    T2->>V2: lock
    T1->>V2: lock (waits)
    T2->>V1: lock (waits)
    Note over T1,T2: deadlock
```

Fix: **always lock the lower id first**. Global ordering means no two
threads ever hold the locks in opposing order.

### Tasks in this phase

1. Define the pluggable MergeStrategy interface + an IpBasedMerge impl
2. Implement deadlock-free pairwise locking in MergeEngine
3. Track per-attribute provenance in CompositeResource
