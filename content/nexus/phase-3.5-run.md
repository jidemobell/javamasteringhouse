### Prerequisites

- Phase 3 environment still running (Postgres up)

### Run it

```bash
cd nexus-phase-3.5
./gradlew test
```

This phase is a refactor checkpoint — no new infra. The tests pin down the
behaviour you should preserve while you split `TopologyService` into
`TopologyReader` + `TopologyWriter`.

### What to edit

- `src/main/java/service/TopologyService.java` — split this
- New: `TopologyReader.java`, `TopologyWriter.java`
