# Phase 5 — Run Instructions

## Start Redis (Docker)

```shell
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

## Start the service

```shell
mvn spring-boot:run -pl reactive-cache
```

## Test caching behaviour

```shell
# First call — hits the database
time curl -s http://localhost:8080/items/1

# Second call — served from Redis cache (should be faster)
time curl -s http://localhost:8080/items/1

# Inspect the key in Redis
docker exec redis redis-cli GET "item:1"
```

## Run tests

```shell
mvn test -pl reactive-cache
```
