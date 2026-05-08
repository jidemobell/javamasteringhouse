### Prerequisites

- JDK 17+ (`java -version`)
- Gradle wrapper (bundled — no install needed)

### Run it

```bash
# 1. Unzip the starter into a fresh folder
unzip nexus-phase-1.zip -d nexus-phase-1
cd nexus-phase-1

# 2. Compile + run the smoke test
./gradlew test
```

You should see **`ResourceContractTest`** pass once the interface is filled in.

### What to edit

- `src/main/java/model/Resource.java` — the interface
- `src/main/java/model/CiscoDevice.java` — one concrete implementation

No external services, no Docker. This phase is pure JVM.
