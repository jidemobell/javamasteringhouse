# Dropwizard Wiring

> Each service in Meridian runs as a standalone HTTP process. This phase focuses
> on the shared pattern: how a service wires itself into Dropwizard 5.1 — from
> typed configuration to registered resources and health checks.

## What every service shares

```
ServiceApplication
  └── extends Application<ServiceConfiguration>
        ├── initialize()   →  bundles, command-line extensions
        └── run()          →  resources, health checks, managed objects
```

No XML. No classpath scanning. No Spring bean factory. Everything the service
exposes is *explicitly registered* in `run()`. If it isn't registered, it doesn't exist.

## Dropwizard 5.1 key points

| Topic | Detail |
|-------|--------|
| Core dep | `io.dropwizard:dropwizard-core:5.1.0` |
| JAX-RS | Jersey 3.x — import `jakarta.ws.rs.*` (not `javax.*`) |
| Validation | Hibernate Validator 8 — `jakarta.validation.*` |
| Lifecycle | Register `ManagedDataSource` / `Kafka Consumer` in `run()` |
| Admin port | `8081` — `/healthcheck`, `/metrics`, `/ping` |

## Pick a service to wire

Choose any service from the Meridian track modules. Each exercise follows the
same four-step pattern:

1. `ServiceConfiguration` — typed YAML binding
2. `ServiceApplication` — wiring manifest
3. `ServiceResource` — JAX-RS endpoint(s)
4. `ServiceHealthCheck` — liveness signal

The exercises below use **InventoryService** as the concrete example, but the
pattern applies equally to topology, status, layout, or any other service.
