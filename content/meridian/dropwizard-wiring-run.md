# Dropwizard Wiring — Run Instructions

## Build

```shell
./gradlew :services:inventory-service:shadowJar
```

## Run

```shell
java -jar services/inventory-service/build/libs/inventory-service-all.jar \
     server services/inventory-service/src/main/resources/application.yml
```

Default ports:
- **8080** — application (REST endpoints)
- **8081** — admin (`/healthcheck`, `/metrics`, `/ping`)

## Check health

```shell
curl -s http://localhost:8081/healthcheck | jq .
# Expected: {"db":{"healthy":true},"deadlocks":{"healthy":true}}
```

## Minimum application.yml

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
  url: jdbc:postgresql://localhost:5432/inventory
  user: inventory
  password: inventory
  maxSize: 8
  minSize: 2
  initialSize: 2

logging:
  level: INFO
  loggers:
    inventory: DEBUG
```
