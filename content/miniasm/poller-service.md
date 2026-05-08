## poller-service

Polls external sources on a schedule. Real-world traps you'll hit:
- A slow source blocks the pool — fix with per-source bounded pools.
- Backoff on failure — exponential with jitter, not constant.
- Graceful shutdown that drains in-flight polls.
