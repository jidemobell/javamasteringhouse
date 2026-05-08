# Nexus — Phase 1 Starter

**The Blueprint: Abstraction & Generics.**

## Setup

You need JDK 17+ and Gradle 8+ (or just `gradle` available on your PATH).

```bash
# Generate the Gradle wrapper (first time only)
gradle wrapper --gradle-version 8.5

# Run the tests
./gradlew test
```

## What to build

1. Open `src/main/java/model/Resource.java`. Define the minimal interface
   every collectible resource must satisfy. Identity, type, freshness.

2. Open `src/main/java/model/CiscoDevice.java`. Make it implement `Resource`.

3. Run `./gradlew test` until `ResourceContractTest` passes.

## Why this matters

You're not designing for Cisco. You're designing for *the next thing* —
ServiceNow, SNMP, anything. The interface is a contract that survives
when the implementations don't.
