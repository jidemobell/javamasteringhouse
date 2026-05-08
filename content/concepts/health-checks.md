## Liveness vs Readiness — they are not the same

| | Liveness | Readiness |
|---|---|---|
| Question | "Is the process wedged?" | "Can I serve traffic right now?" |
| On failure | Restart the pod | Remove from load balancer |
| Should it check DB? | **No** — DB blip ≠ restart me | **Yes** — DB down ≠ I can serve |
| Should it check Kafka? | No | Yes |

A common Dropwizard mistake: registering one `HealthCheck` and using
the same endpoint for both probes. Result: a Kafka hiccup restarts
every pod simultaneously, which makes everything worse.

### A check that earns its keep
```java
public class TopologyDbHealth extends HealthCheck {
    @Override protected Result check() {
        try (Connection c = ds.getConnection();
             Statement  s = c.createStatement()) {
            s.setQueryTimeout(2);
            s.execute("SELECT 1");
            return Result.healthy();
        } catch (Exception e) {
            return Result.unhealthy("db: " + e.getMessage());
        }
    }
}
```

### What to avoid
- `return Result.healthy()` with no actual check.
- Checks that take 30s — they'll get marked failed by the orchestrator first.
- Checking *downstream's* health from your liveness probe (cascading restarts).
