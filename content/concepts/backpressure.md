## Backpressure — what happens when the producer outruns the consumer

Every queue between two processes has three states: filling, full, and
overflowing. **Backpressure is the decision about what happens in the third state.**
Systems that never decide get it chosen for them — by the OOM killer.

### The three options, honestly compared

| Option | What the producer sees | Cost |
|---|---|---|
| **Block** | Slower response | Latency grows unboundedly; connections pile up; the listener may stop accepting |
| **Drop** | Success (a lie) | Silent data loss, healthy-looking metrics |
| **Reject** | `503` + retry hint | Producer must handle it — and most do not retry blindly |

For telemetry, **reject** is usually right: the client can retry, the loss is
visible, and latency stays honest. For payments, blocking may be right. The
mistake is having no explicit choice.

### The Go mechanism

```go
select {
case ch <- item:
    accepted.Inc()
    w.WriteHeader(http.StatusAccepted)
default:
    // Deliberate: fast rejection beats silent loss or unbounded latency.
    rejected.Inc()
    w.Header().Set("Retry-After", "1")
    http.Error(w, "queue full", http.StatusServiceUnavailable)
}
```

`select` with `default` is non-blocking. Remove the `default` and the send blocks —
which is a *different design*, not a bug, as long as you chose it.

### Why this changes your SLI

If the handler blocks when full:

- Latency rises with queue depth, so your latency SLI tracks load rather than
  health.
- Enough blocked handlers exhaust the connection pool, and *availability* fails too.

If the handler rejects:

- Latency stays flat and meaningful.
- Availability absorbs the damage, which is what your availability SLO is for.

**The overload decision determines which SLI is diagnostic.** That is why it
belongs in a design review, not a code review.

### Bounded everywhere

Backpressure only works if every queue is bounded:

- Channel: `make(chan T, depth)` — an unbounded buffer in Go means an unbounded
  memory allocation.
- Connection pool: a max, not a hope.
- Worker count: configurable, so you can raise it without a rebuild.
- Body size: `http.MaxBytesReader` — a request body is a queue too.

### What to avoid

- `go func() { ch <- item }()` to "avoid blocking". You moved the blockage to a
  goroutine leak that grows without limit.
- A retry loop with no backoff and no jitter. That is how a rejection turns into a
  self-inflicted DDoS.
- Queue depth as a *tuning* number rather than a *capacity* number. It is capacity:
  how much work can be in flight before the answer becomes "no".
- Alerting only on failures. Queue depth rising is the leading indicator; failures
  are lagging.

### The one-sentence takeaway

**Choose block, drop or reject explicitly, bound every queue, and let the choice
determine which metric tells the truth.**
