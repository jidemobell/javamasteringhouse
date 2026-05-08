## merge-service

The hardest service. Two sources for the same logical thing → one merged
view, with provenance. The deadlock surface here is real: you're locking
across maps. Apply global lock ordering or `tryLock` with timeout.
