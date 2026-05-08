# Phase 4.5 — Dropwizard HTTP API

> You have a working topology store backed by Postgres. Right now it lives entirely in-process.  
> This phase wires it up to the network: a Dropwizard 5.1 application that exposes the topology over REST and reports its own health.

## What you will build

| Piece | Purpose |
|-------|---------|
| `TopologyApplication` | Entry point — extends `Application<TopologyConfiguration>` |
| `TopologyConfiguration` | Typed YAML config — DB pool settings, Kafka bootstrap |
| `TopologyResource` | `@Path("/topology")` REST resource — GET and POST |
| `DbHealthCheck` | Verifies the Postgres connection is alive |
| `application.yml` | Runtime configuration file |

## Why Dropwizard

Dropwizard bundles Jetty + Jersey + Jackson + Metrics + Health Checks into a single opinionated JAR. There is almost no configuration ceremony — you extend one class, register your resources and health checks, and you have a production-grade HTTP server.

For your team this means:
- The `Application` class is the entire wiring manifest — no XML, no annotations-scanning classpath magic
- `Configuration` is a plain Java object deserialised from YAML — type-safe, testable
- Health checks are first-class: Dropwizard exposes `/healthcheck` automatically; ops teams rely on it

## Dropwizard 5.1 key changes from 4.x

- Jakarta EE 10 namespaces (`jakarta.ws.rs.*` not `javax.ws.rs.*`)
- Jersey 3.x for JAX-RS
- Gradle dependency: `io.dropwizard:dropwizard-core:5.1.0`

## Run instructions

```shell
# Build
./gradlew :services:topology-service:shadowJar

# Run
java -jar services/topology-service/build/libs/topology-service-all.jar \
     server services/topology-service/src/main/resources/application.yml

# Health
curl http://localhost:8081/healthcheck

# GET topology
curl http://localhost:8080/topology/cisco-1

# POST new vertex
curl -X POST http://localhost:8080/topology \
     -H 'Content-Type: application/json' \
     -d '{"id":"cisco-99","type":"cisco-device","hostname":"edge-rtr-99","ip":"10.99.0.1","region":"us-east"}'
```
