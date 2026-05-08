# Phase 4.5 — Run Instructions

## Prerequisites

- Postgres running (from Phase 4)
- Java 21+
- Gradle wrapper available

## Build the fat JAR

```shell
./gradlew :services:topology-service:shadowJar
```

## Start the server

```shell
java -jar services/topology-service/build/libs/topology-service-all.jar \
     server services/topology-service/src/main/resources/application.yml
```

Dropwizard starts two ports by default:
- **8080** — application port (your REST endpoints)
- **8081** — admin port (`/healthcheck`, `/metrics`, `/ping`)

## Verify it's alive

```shell
# Should return {"deadlocks":{"healthy":true},"db":{"healthy":true}}
curl -s http://localhost:8081/healthcheck | jq .

# Should return a vertex JSON
curl -s http://localhost:8080/topology/cisco-1 | jq .

# Submit a new vertex
curl -s -X POST http://localhost:8080/topology \
     -H 'Content-Type: application/json' \
     -d '{"id":"cisco-99","type":"cisco-device","hostname":"edge-rtr-99","ip":"10.99.0.1","region":"us-east"}' \
     | jq .
```

## application.yml template

```yaml
server:
  applicationConnectors:
    - type: http
      port: 8080
  adminConnectors:
    - type: http
      port: 8081

database:
  driverClass: org.postgresql.Driver
  url: jdbc:postgresql://localhost:5432/topology
  user: topology
  password: topology
  maxSize: 10
  minSize: 2
  initialSize: 2
```
