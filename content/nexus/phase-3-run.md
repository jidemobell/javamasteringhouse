### Prerequisites

- JDK 17+
- Docker + Docker Compose (Postgres comes from compose)

### Run it

```bash
cd nexus-phase-3

# Start Postgres
docker compose up -d postgres

# Wait ~5s, then run the app
./gradlew run
```

Stop with `docker compose down` when you're finished.

### What to edit

- `src/main/java/persistence/TopologyDao.java` — JDBC layer
- `src/main/resources/db/migration/V1__init.sql` — schema

### Useful

```bash
psql postgresql://localhost:5432/nexus -U nexus -c "select * from vertices;"
```
