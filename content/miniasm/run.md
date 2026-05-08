### Prerequisites

- JDK 17+
- Docker + Docker Compose (a lot of services — give Docker ~6 GB)
- Gradle wrapper (bundled)

### Bring the stack up

```bash
cd miniasm
docker compose up -d   # Kafka, Postgres, JanusGraph, Cassandra
```

### Run a single service

```bash
./gradlew :inventory-service:run
./gradlew :topology-service:run
./gradlew :poller-service:run
# ... etc
```

Each service exposes its own port (see `application.yml` per module).

### Run the whole thing

```bash
./gradlew runAll   # convenience task in the root build.gradle
```

### What to edit

Pick a service from the sidebar. Each one has its own page with its
responsibilities, the events it produces, and the events it consumes.

### Tear down

```bash
docker compose down -v
```
