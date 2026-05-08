# Phase 2 — Run Instructions

## Start the WebFlux server

```shell
mvn spring-boot:run -pl webflux-controllers
```

## Test endpoints

```shell
# List all items
curl -s http://localhost:8080/items | jq .

# Get a single item
curl -s http://localhost:8080/items/1 | jq .

# SSE stream (keep connection open — Ctrl-C to stop)
curl -s -N -H 'Accept: text/event-stream' http://localhost:8080/items/stream
```

## Run integration tests

```shell
mvn test -pl webflux-controllers
```
