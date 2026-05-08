### Prerequisites

- Everything from Phase 5
- Plus: Prometheus + Grafana (also in compose)

### Run it

```bash
cd nexus-phase-6
docker compose up -d
./gradlew run
```

Then open:

- **App metrics**: http://localhost:8080/metrics
- **Grafana**: http://localhost:3000 (admin / admin)
- **Prometheus**: http://localhost:9090

### What to edit

- `src/main/java/observability/Metrics.java` — Micrometer registry
- `src/main/resources/grafana/dashboard.json` — pre-built dashboard

### Tear down

```bash
docker compose down -v
```
