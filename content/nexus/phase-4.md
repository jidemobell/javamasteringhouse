## Phase 4 — JDBC & Persistence

Snapshot the in-memory topology to Postgres so a restart doesn't wipe state.
Connection pooling (HikariCP), prepared statements, transactional batch
upsert. Skipped the ORM on purpose — you should *see* the SQL.

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
    class M,C,Q,G,T,P done
    class DB active
    class K,X todo
```

> Brightly lit = **what this phase builds**. Dimmed = already in place. Outlined = coming up.

### What you'll build

```
db/
├─ DataSourceFactory.java   pooled HikariCP, sized for the DB
├─ ResourceDao.java         race-free UPSERT (INSERT ... ON CONFLICT)
├─ EdgeDao.java             graph edges in a join table
└─ StaleSweeper.java        marks resources STALE past TTL
```

### The flow per upsert

```mermaid
sequenceDiagram
    participant App
    participant Pool as HikariCP
    participant DB as Postgres
    App->>Pool: getConnection()
    Pool-->>App: pooled Connection (lease)
    App->>DB: PreparedStatement INSERT ON CONFLICT DO UPDATE
    DB-->>App: rows affected
    App->>Pool: close() (returns to pool)
```

### Pool sizing rule of thumb

If `replicas x maximumPoolSize` approaches the DB's `max_connections`, the
*next* replica can't connect at all. Leave headroom for psql sessions,
migrations, monitoring. A common safe target is 80% of `max_connections`.

### The shape of the schema (already created for you)

```sql
CREATE TABLE resources (
  id         VARCHAR(255) PRIMARY KEY,
  type       VARCHAR(50)  NOT NULL,
  name       VARCHAR(255) NOT NULL,
  data       JSONB        NOT NULL,
  last_seen  TIMESTAMP    DEFAULT NOW(),
  status     VARCHAR(20)  DEFAULT 'ACTIVE'
);
```

### Tasks in this phase

1. Configure a HikariCP `DataSource` with sane defaults
2. Implement a race-free `upsert` DAO
3. Add a TTL sweeper that ages out unseen resources
