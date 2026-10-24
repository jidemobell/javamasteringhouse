## context — the cancellation boundary in Go

`context.Context` is how Go answers one question: **"should this work stop?"** It
flows from the entry point (`main`, an HTTP handler) down through every blocking
call. Nothing in between decides to abort on its own.

### The four things it carries

| Feature | Use | Trap |
|---|---|---|
| Cancellation | `<-ctx.Done()` | Ignoring it in a loop that never checks |
| Deadline | `context.WithTimeout` | Derived contexts must be `cancel()`ed |
| Values | request-scoped IDs | Using it as a dependency-injection bag |
| Propagation | automatic down the call stack | A library that ignores ctx breaks the chain |

### Graceful shutdown, in the right order

```go
ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGTERM, os.Interrupt)
defer stop()

go func() { _ = srv.ListenAndServe() }()

<-ctx.Done()

// 1. Fail readiness so no new traffic arrives.
accepting.Store(false)

// 2. Drain in-flight requests, bounded.
shutCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
defer cancel()
_ = srv.Shutdown(shutCtx)

// 3. Now it is safe to close the queue — no handler can send.
queue.Stop()
```

**The ordering is the concept.** Close the queue before `Shutdown` returns and a
live producer panics on send-to-closed-channel. Skip `queue.Stop()` and the process
exits mid-write.

### Always `defer cancel()`

```go
ctx, cancel := context.WithTimeout(parent, 2*time.Second)
defer cancel()               // releases the timer even on the success path
rows, err := db.QueryContext(ctx, q)
```

`go vet` warns about this and it is right: an uncancelled context leaks a timer
until the deadline fires. In a hot path that is a slow memory climb.

### What to avoid

- **`context.Background()` deep in a call chain.** It severs propagation; the
  caller can no longer cancel you.
- **Storing a Context in a struct.** Pass it as the first parameter, always.
- **`time.Sleep` as shutdown.** It is a guess with a delay's syntax.
- **Checking `ctx.Err()` only at the end.** Cancellation must be observed where the
  work happens — inside the loop, on the channel send.
- **Ignoring the error from `Shutdown`.** It tells you the drain timed out, which
  is exactly what you need to log.

### Why this is a reliability concept, not a Go idiom

A service that truncates work on deploy loses data on every release. A service that
drains is *deployable*. Over a year, that difference is measured in incidents that
never happened.

### The one-sentence takeaway

**Let cancellation flow from the top, observe it where the work happens, and shut
down in the order that leaves no producer writing to a closed channel.**
