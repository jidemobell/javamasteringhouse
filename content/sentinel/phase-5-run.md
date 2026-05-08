# Phase 5 — Run Instructions

## Build and test

```shell
./gradlew :sentinel-resilience:test
```

## Run the app

```shell
./gradlew :sentinel-resilience:bootRun
```

## Test circuit breaker behaviour

```shell
# Normal request
curl -s -u user:password http://localhost:8080/api/secure

# Check circuit breaker metrics
curl -s http://localhost:8081/actuator/health | jq .components.circuitBreakers

# Force failures to open the circuit (run several times rapidly)
for i in {1..15}; do
  curl -s "http://localhost:8080/api/simulate-failure" 
done

# Check that circuit is now OPEN
curl -s http://localhost:8081/actuator/health | jq .components.circuitBreakers.details.authServer.details.state
```

## application.yml (resilience4j section)

```yaml
resilience4j:
  circuitbreaker:
    instances:
      authServer:
        failure-rate-threshold: 50
        wait-duration-in-open-state: 10s
        sliding-window-size: 10
        permitted-number-of-calls-in-half-open-state: 3
        register-health-indicator: true

management:
  endpoints:
    web:
      exposure:
        include: health
  health:
    circuitbreakers:
      enabled: true
```
