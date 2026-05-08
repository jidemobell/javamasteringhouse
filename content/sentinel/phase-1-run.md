# Phase 1 — Run Instructions

## Build

```shell
./gradlew :sentinel-security:compileJava
```

## Run tests

```shell
./gradlew :sentinel-security:test
```

## Start the demo app

```shell
./gradlew :sentinel-security:bootRun
```

## Test the endpoints

```shell
# Public endpoint — no auth needed
curl -s http://localhost:8080/public/hello

# Protected endpoint — should return 401 without credentials
curl -s http://localhost:8080/protected/hello

# With basic auth
curl -s -u user:password http://localhost:8080/protected/hello
```
