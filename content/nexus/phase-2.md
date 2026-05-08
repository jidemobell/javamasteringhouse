## Phase 2 — Inheritance & Interfaces

You have multiple data sources. They all do the same dance with one different
step: connect, fetch, validate, enqueue, close. **Connect** and **fetch**
differ per source; everything else is identical. Textbook setup for the
**Template Method** pattern.

The base class owns the lifecycle and is `final` on `run()`. Subclasses
override only what's truly source-specific.

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
    class M done
    class C,Q active
    class G,T,P,DB,K,X todo
```

> Brightly lit = **what this phase builds**. Dimmed = already in place. Outlined = coming up.

### What you'll build

```
collector/
├─ BaseCollector.java           abstract — owns the run() template
├─ CiscoCollector.java          fetches from a (mock) Cisco SSH endpoint
├─ ServiceNowCollector.java     fetches from a (mock) ServiceNow REST API
└─ SnmpCollector.java           proves a third source needs no template change
```

### Class hierarchy

```mermaid
classDiagram
    class Runnable {
        <<interface>>
        +run() void
    }
    class BaseCollector {
        <<abstract>>
        #BlockingQueue sink
        +run() final void
        #connect() void
        #fetch() List
        #validate(item) boolean
        #close() void
    }
    class CiscoCollector
    class ServiceNowCollector
    class SnmpCollector
    Runnable <|.. BaseCollector
    BaseCollector <|-- CiscoCollector
    BaseCollector <|-- ServiceNowCollector
    BaseCollector <|-- SnmpCollector
```

### What flows where

```mermaid
flowchart LR
    Cisco[Cisco mock]
    SNow[ServiceNow mock]
    Snmp[SNMP mock]
    CC[CiscoCollector]
    SC[ServiceNowCollector]
    NC[SnmpCollector]
    Q[(BlockingQueue)]
    Cisco --> CC
    SNow --> SC
    Snmp --> NC
    CC --> Q
    SC --> Q
    NC --> Q
```

### Tasks in this phase

1. Implement the abstract `BaseCollector` template
2. Build a concrete `CiscoCollector`
3. Build a concrete `ServiceNowCollector`
