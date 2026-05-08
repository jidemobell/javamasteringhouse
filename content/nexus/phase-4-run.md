### Prerequisites

- JDK 17+, Docker
- Postgres + Kafka (both via compose)

### Run it

```bash
cd nexus-phase-4
docker compose up -d postgres kafka
./gradlew run
```

In a second terminal, watch the topic:

```bash
docker compose exec kafka \
  kafka-console-consumer --bootstrap-server localhost:9092 \
  --topic topology.changes --from-beginning
```

### What to edit

- `src/main/java/events/ChangePublisher.java` — Kafka producer
- `src/main/java/events/ChangeEvent.java` — the payload contract
