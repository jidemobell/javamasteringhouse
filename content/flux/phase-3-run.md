# Phase 3 — Run Instructions

## Start H2 in-memory (no Docker needed)

```shell
mvn spring-boot:run -pl r2dbc-database
```

## Test the endpoints

```shell
# Create an item
curl -s -X POST http://localhost:8080/items \
     -H 'Content-Type: application/json' \
     -d '{"name":"widget","category":"tools","price":9.99}' | jq .

# Get all items
curl -s http://localhost:8080/items | jq .

# Filter by category
curl -s "http://localhost:8080/items?category=tools" | jq .
```

## Run tests (H2 in-memory, no server needed)

```shell
mvn test -pl r2dbc-database
```
