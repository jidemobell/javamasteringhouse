## The four conditions (all must hold)
1. Mutual exclusion — locks are exclusive.
2. Hold-and-wait — a thread holds one lock while waiting for another.
3. No preemption — locks aren't forcibly taken.
4. Circular wait — A waits on B, B waits on A.

Break **any one** condition and deadlock is impossible.

### The cheapest fix: global lock ordering
If every thread that needs locks A and B always acquires them in the
**same order** (e.g. by `System.identityHashCode`), circular wait can't form.

```java
Object first  = a.hashCode() < b.hashCode() ? a : b;
Object second = first == a ? b : a;
synchronized (first) {
    synchronized (second) {
        // safe transfer
    }
}
```

### Use `tryLock` with a timeout when ordering isn't possible
```java
if (lockA.tryLock(50, MS)) {
    try {
        if (lockB.tryLock(50, MS)) {
            try { /* work */ } finally { lockB.unlock(); }
        } else { /* back off, retry */ }
    } finally { lockA.unlock(); }
}
```

### Diagnosing in production
`jstack <pid>` prints thread dumps. A deadlock section is literally
labelled "Found one Java-level deadlock". That's your smoking gun.
