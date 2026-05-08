import type { Track } from '../../types';

import overviewMd from '../../../content/miniasm/overview.md?raw';
import pollerMd from '../../../content/miniasm/poller-service.md?raw';
import topologyMd from '../../../content/miniasm/topology-service.md?raw';
import mergeMd from '../../../content/miniasm/merge-service.md?raw';
import statusMd from '../../../content/miniasm/status-service.md?raw';
import inventoryMd from '../../../content/miniasm/inventory-service.md?raw';
import layoutMd from '../../../content/miniasm/layout-service.md?raw';
import replicationMd from '../../../content/miniasm/replication-worker.md?raw';
import collectorsMd from '../../../content/miniasm/collectors.md?raw';
import dwWiringMd from '../../../content/meridian/dropwizard-wiring.md?raw';
import dwWiringRun from '../../../content/meridian/dropwizard-wiring-run.md?raw';
import miniasmRun from '../../../content/miniasm/run.md?raw';

// Track B — Mini-ASM (project deep-dive)
// Source: mini-asm/projectcore (real Gradle multi-service backend)
// Mode is 'project' — pick any service module, dive in. No forced order.

export const miniasmTrack: Track = {
  id: 'meridian',
  name: 'Meridian — Multi-Service Deep Dive',
  tagline:
    'A distributed topology platform. Eight services, Kafka, JanusGraph. Pick a service. Read it. Rewrite it.',
  mode: 'project',
  phases: [
    {
      id: 'overview',
      index: 0,
      title: 'System Overview',
      subtitle: 'The eight services and how they talk',
      difficulty: 'mid',
      sourceRef: 'mini-asm/projectcore/README.md',
      concepts: [],
      overview: overviewMd,
      runInstructions: miniasmRun,
      tasks: [],
    },
    {
      id: 'poller-service',
      index: 1,
      title: 'poller-service',
      subtitle: 'Scheduled polling, thread pools, SNMP/SSH adapters',
      difficulty: 'mid',
      sourceRef: 'mini-asm/projectcore/services/poller-service',
      concepts: ['template-method'],
      overview: pollerMd,
      runInstructions: miniasmRun,
      tasks: [],
    },
    {
      id: 'topology-service',
      index: 2,
      title: 'topology-service',
      subtitle: 'Graph ingestion, vertex model, concurrent store',
      difficulty: 'mid',
      sourceRef: 'mini-asm/projectcore/services/topology-service',
      concepts: ['race-conditions'],
      overview: topologyMd,
      runInstructions: miniasmRun,
      tasks: [
        {
          id: 'topology-vertex',
          title: 'Model a TopologyVertex with Builder',
          concepts: ['builder-pattern'],
          brief: `
Build \`TopologyVertex\` — the immutable node model used by the topology store.

**Requirements.**
- Fields: \`id\`, \`type\`, \`hostname\`, \`ip\`, \`region\`, \`lastSeen\`, \`tags\` (a \`Map<String,String>\`).
- Make all fields \`private final\` (except \`tags\` which may be a \`HashMap\`
  copied at construction time).
- Provide a static inner **Builder** so callers never use a 10-arg constructor.
- No setters — the object is immutable after construction.
`,
          samples: [
            {
              filename: 'TopologyVertex.java',
              language: 'java',
              starter: `package topology.model;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

public final class TopologyVertex {
    // TODO: fields, getters, Builder
    public static Builder builder(String id, String type) {
        return new Builder(id, type);
    }

    public static final class Builder {
        // TODO
        public TopologyVertex build() { return new TopologyVertex(this); }
    }
}
`,
              reference: `package topology.model;

import java.time.Instant;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

public final class TopologyVertex {
    private final String id;
    private final String type;
    private final String hostname;
    private final String ip;
    private final String region;
    private final Instant lastSeen;
    private final Map<String, String> tags;

    private TopologyVertex(Builder b) {
        this.id       = Objects.requireNonNull(b.id);
        this.type     = Objects.requireNonNull(b.type);
        this.hostname = b.hostname;
        this.ip       = b.ip;
        this.region   = b.region;
        this.lastSeen = b.lastSeen != null ? b.lastSeen : Instant.now();
        this.tags     = Collections.unmodifiableMap(new HashMap<>(b.tags));
    }

    public String              getId()       { return id; }
    public String              getType()     { return type; }
    public String              getHostname() { return hostname; }
    public String              getIp()       { return ip; }
    public String              getRegion()   { return region; }
    public Instant             getLastSeen() { return lastSeen; }
    public Map<String, String> getTags()     { return tags; }

    public static Builder builder(String id, String type) {
        return new Builder(id, type);
    }

    public static final class Builder {
        private final String id, type;
        private String hostname, ip, region;
        private Map<String, String> tags = new HashMap<>();
        private Instant lastSeen;

        private Builder(String id, String type) { this.id = id; this.type = type; }

        public Builder hostname(String v)          { this.hostname = v; return this; }
        public Builder ip(String v)                { this.ip = v; return this; }
        public Builder region(String v)            { this.region = v; return this; }
        public Builder tag(String k, String v)     { this.tags.put(k, v); return this; }
        public Builder lastSeen(Instant v)         { this.lastSeen = v; return this; }
        public TopologyVertex build()              { return new TopologyVertex(this); }
    }
}
`,
            },
          ],
        },
        {
          id: 'topology-store-race-free',
          title: 'Race-free TopologyStore',
          concepts: ['race-conditions'],
          brief: `
The store wraps a \`ConcurrentHashMap\` of vertices. Implement
\`upsert(TopologyVertex)\` that **never** races. Use \`compute\` so the
update is atomic, and merge tags from old + new instead of overwriting.
`,
          samples: [
            {
              filename: 'TopologyStore.java',
              language: 'java',
              starter: `package topology.service;

import java.util.concurrent.ConcurrentHashMap;
import topology.model.TopologyVertex;

public class TopologyStore {
    private final ConcurrentHashMap<String, TopologyVertex> vertices = new ConcurrentHashMap<>();

    public TopologyVertex upsert(TopologyVertex incoming) {
        // TODO: race-free; merge tags, take latest lastSeen
        return incoming;
    }

    public int size() { return vertices.size(); }
}
`,
              reference: `package topology.service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import topology.model.TopologyVertex;

public class TopologyStore {
    private final ConcurrentHashMap<String, TopologyVertex> vertices = new ConcurrentHashMap<>();

    public TopologyVertex upsert(TopologyVertex incoming) {
        return vertices.compute(incoming.getId(), (id, existing) -> {
            if (existing == null) return incoming;
            Map<String, String> mergedTags = new HashMap<>(existing.getTags());
            mergedTags.putAll(incoming.getTags());
            TopologyVertex.Builder b = TopologyVertex.builder(id, incoming.getType())
                .hostname(pick(incoming.getHostname(), existing.getHostname()))
                .ip(pick(incoming.getIp(), existing.getIp()))
                .region(pick(incoming.getRegion(), existing.getRegion()))
                .lastSeen(incoming.getLastSeen());
            mergedTags.forEach(b::tag);
            return b.build();
        });
    }

    private static String pick(String preferred, String fallback) {
        return (preferred != null && !preferred.isBlank()) ? preferred : fallback;
    }

    public int size() { return vertices.size(); }
}
`,
            },
          ],
        },
      ],
    },
    {
      id: 'merge-service',
      index: 3,
      title: 'merge-service',
      subtitle: 'Composite resources, provenance, deadlock-free locking',
      difficulty: 'advanced',
      sourceRef: 'mini-asm/projectcore/services/merge-service',
      concepts: ['deadlocks', 'provenance-and-merge'],
      overview: mergeMd,
      runInstructions: miniasmRun,
      tasks: [],
    },
    {
      id: 'status-service',
      index: 4,
      title: 'status-service',
      subtitle: 'Health checks done right',
      difficulty: 'mid',
      sourceRef: 'mini-asm/projectcore/services/status-service',
      concepts: ['health-checks'],
      overview: statusMd,
      runInstructions: miniasmRun,
      tasks: [],
    },
    {
      id: 'inventory-service',
      index: 5,
      title: 'inventory-service',
      subtitle: 'JDBC, HikariCP, transactional batch upsert',
      difficulty: 'mid',
      sourceRef: 'mini-asm/projectcore/services/inventory-service',
      concepts: ['connection-pooling'],
      overview: inventoryMd,
      runInstructions: miniasmRun,
      tasks: [],
    },
    {
      id: 'layout-service',
      index: 6,
      title: 'layout-service',
      subtitle: 'Graph layout, caching, TTL',
      difficulty: 'mid',
      sourceRef: 'mini-asm/projectcore/services/layout-service',
      concepts: [],
      overview: layoutMd,
      runInstructions: miniasmRun,
      tasks: [],
    },
    {
      id: 'replication-worker',
      index: 7,
      title: 'replication-worker',
      subtitle: 'Kafka consumer, idempotency, retries',
      difficulty: 'advanced',
      sourceRef: 'mini-asm/projectcore/services/replication-worker',
      concepts: ['kafka-producer-consumer'],
      overview: replicationMd,
      runInstructions: miniasmRun,
      tasks: [],
    },
    {
      id: 'collectors',
      index: 8,
      title: 'collectors (cross-cutting)',
      subtitle: 'Template Method in production',
      difficulty: 'advanced',
      sourceRef: 'mini-asm/projectcore/shared',
      concepts: ['template-method'],
      overview: collectorsMd,
      runInstructions: miniasmRun,
      tasks: [],
    },
    {
      id: 'dropwizard-wiring',
      index: 9,
      title: 'Dropwizard Wiring',
      subtitle: 'Register resources, health checks, and managed objects',
      difficulty: 'mid',
      sourceRef: 'mini-asm/projectcore/services/',
      concepts: ['dropwizard'],
      overview: dwWiringMd,
      runInstructions: dwWiringRun,
      tasks: [
        {
          id: 'service-configuration',
          title: 'Define a typed ServiceConfiguration',
          concepts: ['dropwizard'],
          brief: `
> 🧠 **Concept — Typed Configuration**
>
> Dropwizard validates your YAML file before \`run()\` is called.
> If a required field is missing or invalid, the server refuses to start —
> not when the first request hits a null field.
>
> - ✅ Annotate every required field with \`@Valid @NotNull\`
> - ✅ Use \`DataSourceFactory\` for database settings — it brings HikariCP
>   pool tuning for free
> - ❌ Don't store raw strings for URLs/credentials — use the typed factory
>   objects Dropwizard already provides
>
> Mental model: \`Configuration\` is your service's contract with the ops
> team. They configure it; you code against it. Validation makes that
> contract explicit at startup time.

Pick any Meridian service. Define its \`Configuration\` class with at least a
\`DataSourceFactory\` field. Use \`@Valid @NotNull\` and wire a \`@JsonProperty\`
getter and setter.
`,
          samples: [
            {
              filename: 'InventoryConfiguration.java',
              language: 'java',
              starter: `package inventory;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.dropwizard.core.Configuration;
import io.dropwizard.db.DataSourceFactory;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public class InventoryConfiguration extends Configuration {
    // TODO: add DataSourceFactory 'database' with @Valid @NotNull
    //       and @JsonProperty getter + setter
}
`,
              reference: `package inventory;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.dropwizard.core.Configuration;
import io.dropwizard.db.DataSourceFactory;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public class InventoryConfiguration extends Configuration {
    @Valid
    @NotNull
    private DataSourceFactory database = new DataSourceFactory();

    @JsonProperty("database")
    public DataSourceFactory getDatabase() { return database; }

    @JsonProperty("database")
    public void setDatabase(DataSourceFactory db) { this.database = db; }
}
`,
            },
          ],
        },
        {
          id: 'service-application',
          title: 'Write the Application wiring manifest',
          concepts: ['dropwizard'],
          brief: `
Build \`InventoryApplication extends Application<InventoryConfiguration>\`.

In \`run()\`:
1. Build a \`ManagedDataSource\` and register it with \`env.lifecycle()\`
2. Instantiate your repository/store with the data source
3. Register your resource: \`env.jersey().register(...)\`
4. Register your health check: \`env.healthChecks().register("db", ...)\`

**Why explicit wiring?** Dropwizard has no auto-discovery. The benefit is
that reading \`run()\` gives a complete picture of what the service does —
no surprises from annotation-scanned beans you didn't know existed.
`,
          samples: [
            {
              filename: 'InventoryApplication.java',
              language: 'java',
              starter: `package inventory;

import io.dropwizard.core.Application;
import io.dropwizard.core.setup.Bootstrap;
import io.dropwizard.core.setup.Environment;

public class InventoryApplication extends Application<InventoryConfiguration> {

    public static void main(String[] args) throws Exception {
        new InventoryApplication().run(args);
    }

    @Override
    public void initialize(Bootstrap<InventoryConfiguration> bootstrap) {}

    @Override
    public void run(InventoryConfiguration config, Environment env) throws Exception {
        // TODO: build ManagedDataSource, register with lifecycle
        // TODO: build InventoryRepository
        // TODO: register InventoryResource
        // TODO: register DbHealthCheck
    }
}
`,
              reference: `package inventory;

import io.dropwizard.core.Application;
import io.dropwizard.core.setup.Bootstrap;
import io.dropwizard.core.setup.Environment;
import io.dropwizard.db.ManagedDataSource;
import inventory.db.InventoryRepository;
import inventory.health.DbHealthCheck;
import inventory.resource.InventoryResource;

public class InventoryApplication extends Application<InventoryConfiguration> {

    public static void main(String[] args) throws Exception {
        new InventoryApplication().run(args);
    }

    @Override
    public void initialize(Bootstrap<InventoryConfiguration> bootstrap) {}

    @Override
    public void run(InventoryConfiguration config, Environment env) throws Exception {
        ManagedDataSource ds = config.getDatabase()
            .build(env.metrics(), "inventory-db");
        env.lifecycle().manage(ds);

        InventoryRepository repo = new InventoryRepository(ds);
        env.jersey().register(new InventoryResource(repo));
        env.healthChecks().register("db", new DbHealthCheck(ds));
    }
}
`,
            },
          ],
        },
      ],
    },
    {
      id: 'memory-awareness',
      index: 10,
      title: 'Memory Awareness & Heap Dumps',
      subtitle: 'Diagnose memory issues and analyze heap dumps',
      difficulty: 'mid',
      sourceRef: 'mini-asm/projectcore/README.md',
      concepts: ['memory-management'],
      overview: '',
      runInstructions: miniasmRun,
      tasks: [
        {
          id: 'heap-dump-exercise',
          title: 'Trigger and Analyse a Heap Dump',
          concepts: ['memory-management'],
          brief: `
> 🧠 **Concept — Heap Dumps**
>
> A heap dump is a snapshot of every object alive on the heap at a point in time.
> There are two ways to capture one:
>
> - **On crash**: \`-XX:+HeapDumpOnOutOfMemoryError\` — JVM writes the dump automatically when it throws \`OutOfMemoryError\`
> - **On demand**: \`jcmd <pid> GC.heap_dump /path/to/out.hprof\` — snapshot a *running* process without crashing it
>
> - ✅ \`jcmd\` dump → you catch the leak *before* the service dies; you can take multiple dumps and compare them
> - ✅ OOM dump → exact state at time of death, nothing has been cleaned up yet
> - ❌ Restarting the service without a dump → you destroyed the evidence; the leak is still there, you just reset the clock
>
> Mental model: a heap dump is a crime scene photo. Production systems can't wait for the crash — \`jcmd\` is how you investigate while the scene is still live.

**Exercise A — OOM dump (the crash case).**
Run \`LeakyCache\` with a small heap. It crashes; the JVM writes the dump automatically.

\`\`\`
javac LeakyCache.java
java -Xmx64m -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/tmp/oom.hprof LeakyCache
\`\`\`

**Exercise B — \`jcmd\` dump (the live-process case).**
Start \`LeakyCache\` with a larger heap so it runs for a while. In a second terminal,
find its PID and grab a dump while it's still alive:

\`\`\`
# Terminal 1 — let it run
java -Xmx512m LeakyCache

# Terminal 2 — while it's running
jcmd                                          # lists all running JVMs and PIDs
jcmd <pid> GC.heap_dump /tmp/live.hprof       # grab the dump
\`\`\`

Open \`/tmp/live.hprof\` in **VisualVM** (File → Load) or **Eclipse MAT**.

**Questions to answer after opening the dump:**
1. In the *Dominator Tree* — which class retains the most heap?
2. Follow the reference chain to the GC root. What is keeping it alive?
3. Why doesn't the GC collect it even though nothing in the main logic still *needs* those entries?
4. How would you fix this in production without a restart?
`,
          samples: [
            {
              filename: 'LeakyCache.java',
              language: 'java',
              starter: `package diagnostics;

import java.util.HashMap;
import java.util.Map;

/**
 * Simulates a service that caches responses but never evicts them.
 * Run with a small heap to trigger OOM, or with a large heap and jcmd
 * to grab a live dump before it crashes.
 */
public class LeakyCache {

    // TODO: why is this static? what happens to it when the method returns?
    private static final Map<String, byte[]> CACHE = new HashMap<>();

    public static void main(String[] args) throws InterruptedException {
        System.out.println("PID: " + ProcessHandle.current().pid());
        System.out.println("Starting — attach jcmd or wait for OOM...");

        for (int i = 0; ; i++) {
            // Simulate: "cache the response payload for request key i"
            String key = "request-" + i;
            byte[] payload = new byte[50 * 1024]; // 50 KB per entry
            // TODO: put it in CACHE — then notice it never leaves
            Thread.sleep(10);
            if (i % 100 == 0) {
                System.out.printf("cached %d entries (~%d MB)%n",
                    CACHE.size(), (CACHE.size() * 50) / 1024);
            }
        }
    }
}
`,
              reference: `package diagnostics;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Fixed version: bounded LRU cache using LinkedHashMap.
 *
 * The original bug: CACHE was static and unbounded — every entry put in
 * during the lifetime of the JVM stayed there forever. The GC cannot
 * collect them because the static field is always a GC root.
 *
 * Fix: cap the cache at a fixed size and evict the least-recently-used entry
 * when it would overflow. LinkedHashMap.removeEldestEntry() does this in
 * two lines.
 *
 * --- How to reproduce and analyse the original leak ---
 *
 * 1. OOM path (Exercise A):
 *    javac LeakyCache.java
 *    java -Xmx64m -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/tmp/oom.hprof LeakyCache
 *
 * 2. Live dump path (Exercise B):
 *    java -Xmx512m LeakyCache          # Terminal 1 — note the PID it prints
 *    jcmd                               # Terminal 2 — confirm PID
 *    jcmd <pid> GC.heap_dump /tmp/live.hprof
 *
 * In VisualVM / Eclipse MAT:
 *   - Dominator Tree → HashMap (or LinkedHashMap) entry array is the top retainer
 *   - Path to GC Root → LeakyCache.CACHE (static field) → HashMap → byte[][] entries
 *   - Static fields are always GC roots — the map is never eligible for collection
 */
public class LeakyCache {

    private static final int MAX_ENTRIES = 500;

    // LinkedHashMap with access order + removeEldestEntry = automatic LRU eviction
    private static final Map<String, byte[]> CACHE = new LinkedHashMap<>(MAX_ENTRIES, 0.75f, true) {
        @Override
        protected boolean removeEldestEntry(Map.Entry<String, byte[]> eldest) {
            return size() > MAX_ENTRIES;
        }
    };

    public static void main(String[] args) throws InterruptedException {
        System.out.println("PID: " + ProcessHandle.current().pid());
        System.out.println("Starting — cache capped at " + MAX_ENTRIES + " entries");

        for (int i = 0; ; i++) {
            String key = "request-" + i;
            byte[] payload = new byte[50 * 1024];
            CACHE.put(key, payload);
            Thread.sleep(10);
            if (i % 100 == 0) {
                System.out.printf("i=%d  cache size=%d (capped)%n", i, CACHE.size());
            }
        }
    }
}
`,
            },
          ],
        },
      ],
    },
  ],
};
