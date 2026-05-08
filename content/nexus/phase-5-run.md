### Prerequisites

- Full stack: Postgres + Kafka + JanusGraph
- ~4 GB free RAM (JanusGraph + Cassandra are not light)

### Run it

```bash
cd nexus-phase-5
docker compose up -d
# Wait ~30s for JanusGraph to settle, then:
./gradlew run
```

Open the Gremlin console:

```bash
docker compose exec janusgraph ./bin/gremlin.sh
gremlin> :remote connect tinkerpop.server conf/remote.yaml
gremlin> g.V().count()
```

### What to edit

- `src/main/java/graph/GraphSink.java` — JanusGraph writer
- `src/main/resources/janusgraph.properties`
