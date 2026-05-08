## Why this is the hardest service in any topology system

Two sources discover what is logically the same router. They disagree on
hostname casing. One has the IP, the other has the owning team. **Both are
right.** Your job: produce one composite, lose nothing, remember who said what.

## Provenance: don't merge, *attribute*

Every field on the merged object carries its source:

```java
public final class Attributed<T> {
    public final T value;
    public final String source;     // "snmp", "servicenow"
    public final Instant observedAt;
    public final int confidence;    // 0-100
}
```

When sources disagree, the merge engine picks by rule (highest confidence,
most recent, or source priority). The losing value isn't deleted — it's
kept in a `history` list. When a customer asks "why does ASM say 10.0.0.1?",
you can answer.

## Merge strategy as an interface (Strategy Pattern)

```java
public interface MergeStrategy {
    boolean matches(Resource a, Resource b);   // are these the same thing?
    CompositeResource merge(Resource a, Resource b);
}

public class IpBasedMerge implements MergeStrategy { ... }
public class HostnameMerge implements MergeStrategy { ... }
```

The engine tries strategies in priority order. First match wins.

## The deadlock surface

Merging touches **two** vertices in the topology graph. If thread T1 merges
`(A, B)` while T2 merges `(B, A)`, and you lock per-vertex in argument
order — classic deadlock.

Fix: **global lock ordering** by id (see Deadlocks concept). Always lock
the lower id first, regardless of argument order. One line. Problem gone.

## What "match" really means in production

Don't match on a single attribute. Match on a **scoring function**:
- IP equal → +50
- Hostname equal (case-insensitive) → +30
- MAC address equal → +60
- Sysname matches → +20

Merge if score ≥ threshold. This survives the messy reality of partial,
overlapping data far better than a single-key join.
