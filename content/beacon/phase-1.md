## Phase 1 — A Go Service That Refuses to Guess

You are building **`relayd`**: a small service that accepts telemetry events from
devices on a home network, validates them, and hands them to a queue for
processing. It is deliberately unglamorous. Everything the rest of this track
does — metrics, Terraform, SLOs, incident response — needs a service that behaves
predictably first.

### Where this fits

```mermaid
flowchart LR
    P1["Phase 1<br/>Skeleton"]
    P2["Phase 2<br/>Concurrency"]
    P3["Phase 3<br/>Instrumentation"]
    P4["Phase 4<br/>Terraform"]
    P5["Phase 5<br/>SLOs"]
    P6["Phase 6<br/>Incidents"]
    P1 --> P2 --> P3 --> P4 --> P5 --> P6
    classDef done fill:#1e293b,stroke:#475569,color:#94a3b8
    classDef active fill:#0f766e,stroke:#22d3ee,color:#e0f2fe,stroke-width:3px
    classDef todo fill:#0b1020,stroke:#334155,color:#475569
    class P1 active
    class P2,P3,P4,P5,P6 todo
```

---

### Three things to see instantly

> 🧠 **Go's error handling is not boilerplate — it is the design.** A function that
> can fail returns `(T, error)`. The caller decides what to do. There is no
> exception unwinding, so there is no hidden control flow, and no `catch` three
> frames away that you forgot about.

1. **`net/http` is enough.** A production service is `http.Server` + a mux + a
   handler that returns. Frameworks add routing sugar, not reliability.
2. **Config fails loud.** Read the environment at startup, validate it, and
   `log.Fatal` on nonsense. A service that starts with `PORT=""` and fails on the
   first request has moved its failure from deploy time to 3am.
3. **Wrap, don't flatten.** `fmt.Errorf("decode body: %w", err)` keeps the chain
   inspectable with `errors.Is`. `fmt.Errorf("decode body: %v", err)` throws the
   chain away — and that is the difference between a 5-minute and a 50-minute
   investigation.

### The shape you are aiming for

```go
type Config struct {
    Port          string
    QueueDepth    int
    ShutdownGrace time.Duration
}

func LoadConfig() (Config, error) {
    cfg := Config{Port: "8080", QueueDepth: 256, ShutdownGrace: 10 * time.Second}
    if v := os.Getenv("PORT"); v != "" { cfg.Port = v }
    if v := os.Getenv("QUEUE_DEPTH"); v != "" {
        n, err := strconv.Atoi(v)
        if err != nil { return Config{}, fmt.Errorf("QUEUE_DEPTH: %w", err) }
        cfg.QueueDepth = n
    }
    if cfg.QueueDepth < 1 { return Config{}, errors.New("QUEUE_DEPTH must be >= 1") }
    return cfg, nil
}
```

Note what is *not* there: no defaults buried in the handler, no `mustInt()` that
panics deep in a request path.

### Why this phase is not a warm-up

Everything later measures this service. If a malformed event panics, your
availability SLI measures your own bug rather than the system's behaviour, and the
SLO in Phase 5 becomes meaningless. **You cannot measure what you have not made
deterministic.**

### The one-sentence takeaway

**Validate at the edge, wrap errors so the chain survives, and never let a request
path panic — the phases after this all depend on it.**
