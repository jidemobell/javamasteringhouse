# Phase 4 — Run Instructions

## Build and test

```shell
./gradlew :sentinel-multitenancy:test
```

## Run the app

```shell
./gradlew :sentinel-multitenancy:bootRun
```

## Test tenant isolation

```shell
# Tenant A's items
curl -s -H "X-Tenant-ID: tenant-a" -u user:password \
     http://localhost:8080/api/items | jq .

# Tenant B's items (should be different)
curl -s -H "X-Tenant-ID: tenant-b" -u user:password \
     http://localhost:8080/api/items | jq .

# Missing tenant header — should return 400
curl -s -u user:password http://localhost:8080/api/items
```
