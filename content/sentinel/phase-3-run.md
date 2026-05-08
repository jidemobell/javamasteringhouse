# Phase 3 — Run Instructions

## Build and test

```shell
./gradlew :sentinel-method-security:test
```

## Run the app

```shell
./gradlew :sentinel-method-security:bootRun
```

## Test method security via HTTP

```shell
# As admin — should succeed
curl -s -u admin:admin http://localhost:8080/api/items/1/delete

# As regular user — should return 403
curl -s -u user:password http://localhost:8080/api/items/1/delete
```
