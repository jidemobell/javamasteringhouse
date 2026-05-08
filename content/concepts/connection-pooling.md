## Why pooling exists

Every `DriverManager.getConnection()` is a TCP handshake + auth round-trip
+ session setup. ~50-200ms. A request that opens, queries, and closes a
connection per call is a load test waiting to happen.

A pool keeps N connections **already open** and lends them out.

## Sizing the pool — the surprising rule

Bigger is **not** better. Postgres has its own `max_connections`. If your
app has 4 instances × pool size 50, you've used 200 of (typically) 100. The
DB will refuse the rest, your app will throw `SQLTransientConnectionException`,
and a junior engineer will "fix" it by raising `max_connections` instead of
shrinking the pool. Don't be that engineer.

A defensible starting point: `pool_size ≈ ((core_count × 2) + effective_spindle_count)`.
For a typical 4-core app server hitting an SSD-backed DB: **8–10**.

## HikariCP config that actually matters

```java
HikariConfig cfg = new HikariConfig();
cfg.setJdbcUrl("jdbc:postgresql://db:5432/topology");
cfg.setUsername("app");
cfg.setPassword(System.getenv("DB_PASSWORD"));
cfg.setMaximumPoolSize(10);          // hard ceiling
cfg.setMinimumIdle(2);
cfg.setConnectionTimeout(3_000);     // fail fast if pool exhausted
cfg.setIdleTimeout(600_000);
cfg.setMaxLifetime(1_800_000);       // < your DB's idle-in-transaction kill
cfg.setLeakDetectionThreshold(20_000); // log if a connection isn't returned
HikariDataSource ds = new HikariDataSource(cfg);
```

## The mistake that costs hours

```java
Connection c = ds.getConnection();
// ... query ...
// (forgot c.close())
```

`close()` doesn't close — it returns to the pool. Forget it once and the
pool drains permanently. **Always** use try-with-resources:

```java
try (Connection c = ds.getConnection();
     PreparedStatement ps = c.prepareStatement("...")) {
    ...
}
```

`leakDetectionThreshold` will log a stack trace when you forget. Turn it on
in non-prod environments and leave it.
