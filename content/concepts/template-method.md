## Template Method — the "Super Collector" idea

You have many collectors (Cisco, ServiceNow, SNMP, REST). They all do the
**same dance**: connect → fetch → validate → enqueue → close. Only the
*fetch* step differs.

Don't copy-paste the dance into every collector. Put the dance in an
**abstract base class** as a `final` method, and let subclasses override
just the step that varies.

```java
public abstract class BaseCollector<T extends Resource> implements Runnable {
    protected final BlockingQueue<T> sink;

    protected BaseCollector(BlockingQueue<T> sink) { this.sink = sink; }

    // The "template" — fixed skeleton, callers cannot override.
    public final void run() {
        try {
            connect();
            for (T item : fetch()) {        // <- the only variable step
                if (validate(item)) sink.put(item);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            close();
        }
    }

    protected abstract void connect();
    protected abstract List<T> fetch();     // subclass-specific
    protected boolean validate(T item) { return item != null; }
    protected void close() { /* default no-op */ }
}
```

### Why it matters in real distributed systems
- Adding a new source = one class, ~30 lines. No risk of breaking the others.
- The lifecycle (connect/close, interrupt handling) is written **once, correctly**.
- Code review surface shrinks: reviewers focus on `fetch()`, not boilerplate.

### Smell that says "use Template Method"
You see three classes whose `run()` methods are 80% identical with one
loop body different. That's the signal.

### Contrast with Strategy
- Template Method: **inheritance**, the algorithm lives in the parent.
- Strategy: **composition**, the algorithm is injected as an object.
Both are valid. Use Template when the dance is fixed and the variation is
*one step*; use Strategy when the variation is the *whole algorithm*.
