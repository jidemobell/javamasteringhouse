## Mini-ASM at a glance

Eight Dropwizard services, one Kafka bus, one JanusGraph (over Cassandra) topology
store, Postgres for inventory.

```
poller-service ──► inventory-service ──► topology-service ──► merge-service
                          │                       │
                          ▼                       ▼
                       Postgres                JanusGraph
                                                  ▲
   layout-service ◄──── status-service ◄──────────┤
                                                  │
                          replication-worker ─────┘
```

Each service is a phase below. They are **independent** — you can do
`status-service` before `poller-service`. Pick whichever solves a question
you currently have.
