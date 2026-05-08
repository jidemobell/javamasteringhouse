import type { Track } from '../../types';

import phase1Md from '../../../content/nexus/phase-1.md?raw';
import phase2Md from '../../../content/nexus/phase-2.md?raw';
import phase25Md from '../../../content/nexus/phase-2.5.md?raw';
import phase3Md from '../../../content/nexus/phase-3.md?raw';
import phase35Md from '../../../content/nexus/phase-3.5.md?raw';
import phase4Md from '../../../content/nexus/phase-4.md?raw';
import phase45Md from '../../../content/nexus/phase-4.5.md?raw';
import phase5Md from '../../../content/nexus/phase-5.md?raw';
import phase6Md from '../../../content/nexus/phase-6.md?raw';

import phase1Run from '../../../content/nexus/phase-1-run.md?raw';
import phase2Run from '../../../content/nexus/phase-2-run.md?raw';
import phase25Run from '../../../content/nexus/phase-2.5-run.md?raw';
import phase3Run from '../../../content/nexus/phase-3-run.md?raw';
import phase35Run from '../../../content/nexus/phase-3.5-run.md?raw';
import phase4Run from '../../../content/nexus/phase-4-run.md?raw';
import phase45Run from '../../../content/nexus/phase-4.5-run.md?raw';
import phase5Run from '../../../content/nexus/phase-5-run.md?raw';
import phase6Run from '../../../content/nexus/phase-6-run.md?raw';

// Track A — Nexus Route Topology Simulator (phased workshop)
// Source: general-knowlegde/projects/nexus-route-topology-simulator/

export const nexusTrack: Track = {
  id: 'nexus',
  name: 'Nexus — Route Topology Simulator',
  tagline:
    'Phased build of a multi-threaded topology collector. From abstraction → concurrency → persistence → events.',
  mode: 'phased',
  phases: [
    {
      id: 'phase-1',
      index: 1,
      title: 'The Blueprint',
      subtitle: 'Abstraction & Generics',
      difficulty: 'mid',
      sourceRef:
        'general-knowlegde/projects/nexus-route-topology-simulator/phase1-abstraction-and-generics.md',
      concepts: ['generics-wildcards', 'builder-pattern'],
      overview: phase1Md,
      runInstructions: phase1Run,
      starterZip: 'nexus-phase-1.zip',
      tasks: [
        {
          id: 'resource-interface',
          title: 'Define the Resource contract',
          concepts: ['generics-wildcards'],
          brief: `
Define a minimal interface every collectible thing must satisfy.

Decide: what's the *smallest* set of methods every resource — Cisco router,
ServiceNow record, future SNMP host — must expose?

**Hint.** Identity (\`getId()\`), kind (\`getType()\`), and a freshness signal
(\`getLastSeen()\`) are usually enough. Anything else is leakage.
`,
          samples: [
            {
              filename: 'Resource.java',
              language: 'java',
              starter: `package model;

import java.time.Instant;

public interface Resource {
    // TODO: identity, type, freshness
}
`,
              reference: `package model;

import java.time.Instant;

public interface Resource {
    String  getId();
    String  getType();
    Instant getLastSeen();
}
`,
            },
          ],
        },
        {
          id: 'vertex-generic',
          title: 'Build the generic Vertex<R>',
          concepts: ['generics-wildcards', 'testing'],
          brief: `
**Build \`Vertex<R extends Resource>\`** with:

- A single \`final\` field: \`payload\` (of type \`R\`).
- A **derived id**: \`"vertex:" + payload.getType() + ":" + payload.getId()\`.
  Same payload → same vertex id. This makes deduplication trivial.
- \`equals\` and \`hashCode\` based on \`id\` alone — two Vertex instances with
  the same underlying resource are *the same node*, even if constructed
  separately.

**TDD checkpoint.** Open \`VertexContractTest.java\` first. Make them fail,
then write the class, then make them pass.
`,
          samples: [
            {
              filename: 'Vertex.java',
              language: 'java',
              starter: `package model;

public final class Vertex<R /* TODO bound */> {
    // TODO: payload, derived id, equals/hashCode
}
`,
              reference: `package model;

import java.util.Objects;

public final class Vertex<R extends Resource> {
    private final R payload;
    private final String id;

    public Vertex(R payload) {
        this.payload = Objects.requireNonNull(payload, "payload");
        this.id = "vertex:" + payload.getType() + ":" + payload.getId();
    }

    public R      getPayload() { return payload; }
    public String getId()      { return id; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Vertex<?> other)) return false;
        return this.id.equals(other.id);
    }

    @Override
    public int hashCode() { return id.hashCode(); }

    @Override
    public String toString() { return id; }
}
`,
            },
          ],
        },
        {
          id: 'cisco-device',
          title: 'Implement CiscoDevice',
          concepts: ['generics-wildcards'],
          brief: `
Time for a concrete \`Resource\`. \`CiscoDevice\` represents a real router or
switch you'd discover on the network.

**Requirements.**
- Implement \`Resource\` — \`getId()\`, \`getType()\`, \`getLastSeen()\`.
- \`getType()\` must return the constant \`"cisco-device"\`.
- Add Cisco-specific fields: \`hostname\`, \`mgmtIp\`, \`osVersion\`.
- \`lastSeen\` starts at construction time. Expose a \`touch()\` method that
  advances it to *now* — the poller will call this when it re-discovers the
  device.
- Make the class \`final\`. Make every field \`private\`. No setters except
  \`touch()\`.
`,
          samples: [
            {
              filename: 'CiscoDevice.java',
              language: 'java',
              starter: `package model;

import java.time.Instant;

public final class CiscoDevice /* TODO implements Resource */ {
    private final String id;
    private final String hostname;
    private final String mgmtIp;
    private final String osVersion;
    private Instant lastSeen;

    public CiscoDevice(String id, String hostname, String mgmtIp, String osVersion) {
        this.id = id;
        this.hostname = hostname;
        this.mgmtIp = mgmtIp;
        this.osVersion = osVersion;
        this.lastSeen = Instant.now();
    }

    // TODO: Resource methods, getters, touch()
}
`,
              reference: `package model;

import java.time.Instant;
import java.util.Objects;

public final class CiscoDevice implements Resource {
    private final String id;
    private final String hostname;
    private final String mgmtIp;
    private final String osVersion;
    private Instant lastSeen;

    public CiscoDevice(String id, String hostname, String mgmtIp, String osVersion) {
        this.id        = Objects.requireNonNull(id);
        this.hostname  = Objects.requireNonNull(hostname);
        this.mgmtIp    = Objects.requireNonNull(mgmtIp);
        this.osVersion = Objects.requireNonNull(osVersion);
        this.lastSeen  = Instant.now();
    }

    @Override public String  getId()       { return id; }
    @Override public String  getType()     { return "cisco-device"; }
    @Override public Instant getLastSeen() { return lastSeen; }

    public String getHostname()   { return hostname; }
    public String getMgmtIp()     { return mgmtIp; }
    public String getOsVersion()  { return osVersion; }

    /** Called by the poller every time the device responds. */
    public void touch() { this.lastSeen = Instant.now(); }
}
`,
            },
          ],
        },
        {
          id: 'servicenow-record',
          title: 'Implement ServiceNowRecord',
          concepts: ['generics-wildcards'],
          brief: `
A second concrete \`Resource\` — this time something the network has *never*
talked to. ServiceNow records describe configuration items (CIs) imported
from an external CMDB.

**Why this matters.** Two unrelated implementations exercise the abstraction.
If you can swap one in for the other without breaking \`Vertex<T>\`, your
contract is honest.

**Requirements.**
- Implement \`Resource\`. \`getType()\` returns \`"servicenow-ci"\`.
- Fields: \`sysId\` (their primary key), \`name\`, \`ciClass\` (e.g. "server",
  "application"), \`updatedAt\` (\`Instant\`).
- \`getId()\` should return \`sysId\`.
- \`getLastSeen()\` should return \`updatedAt\` — *they* tell us when it
  changed, we don't measure freshness ourselves.
- Immutable. No setters. To "update" a record, construct a new one.
`,
          samples: [
            {
              filename: 'ServiceNowRecord.java',
              language: 'java',
              starter: `package model;

import java.time.Instant;

public final class ServiceNowRecord /* TODO implements Resource */ {
    private final String sysId;
    private final String name;
    private final String ciClass;
    private final Instant updatedAt;

    public ServiceNowRecord(String sysId, String name, String ciClass, Instant updatedAt) {
        this.sysId = sysId;
        this.name = name;
        this.ciClass = ciClass;
        this.updatedAt = updatedAt;
    }

    // TODO
}
`,
              reference: `package model;

import java.time.Instant;
import java.util.Objects;

public final class ServiceNowRecord implements Resource {
    private final String sysId;
    private final String name;
    private final String ciClass;
    private final Instant updatedAt;

    public ServiceNowRecord(String sysId, String name, String ciClass, Instant updatedAt) {
        this.sysId     = Objects.requireNonNull(sysId);
        this.name      = Objects.requireNonNull(name);
        this.ciClass   = Objects.requireNonNull(ciClass);
        this.updatedAt = Objects.requireNonNull(updatedAt);
    }

    @Override public String  getId()       { return sysId; }
    @Override public String  getType()     { return "servicenow-ci"; }
    @Override public Instant getLastSeen() { return updatedAt; }

    public String getName()    { return name; }
    public String getCiClass() { return ciClass; }
}
`,
            },
          ],
        },
        {
          id: 'seed-topology',
          title: 'Demonstrate the abstraction',
          concepts: ['generics-wildcards'],
          brief: `
You have all four pieces. Wire them up — but no linking yet.

Build a small in-memory collection: three Cisco devices, two ServiceNow
records. Wrap each in a \`Vertex<…>\`. Print every vertex's id, type and
\`lastSeen\`. Verify dedup: build the same Cisco device twice, wrap it in
two separate Vertex instances, then put both in a \`Set<Vertex<?>>\` —
the set size should be **5**, not **6**, because equality by id collapses
the duplicate.

**Goals.**
- Prove the generics work — \`Vertex<CiscoDevice>\` and
  \`Vertex<ServiceNowRecord>\` are distinct types; the compiler enforces it.
- Prove dedup works — same payload (id + type) → same vertex id → equal
  vertices → a Set keeps one of them.
- Notice the printing code only sees \`Resource\`. It doesn't care what's
  inside. That's the payoff.

**Foreshadow.** You'll want to *connect* the Cisco devices to each other,
and a ServiceNow application to the Cisco it runs on. Resist the urge to
add \`link()\` to Vertex. That moment of frustration is real — it's the
exact pain Phase 2.5 will solve when we introduce the Graph layer.
`,
          samples: [
            {
              filename: 'Seed.java',
              language: 'java',
              starter: `package model;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

public class Seed {
    public static void main(String[] args) {
        // TODO: build 3 CiscoDevice + 2 ServiceNowRecord
        // TODO: wrap each in a Vertex<...>
        // TODO: print id + type + lastSeen for every vertex
        // TODO: prove dedup — add a duplicate Cisco to a Set<Vertex<?>>; size stays 5
    }
}
`,
              reference: `package model;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.Set;

public class Seed {
    public static void main(String[] args) {
        // --- Cisco devices ---
        Vertex<CiscoDevice> r1 = new Vertex<>(
            new CiscoDevice("cisco-1", "core-rtr-01", "10.0.0.1", "IOS-XE 17.6"));
        Vertex<CiscoDevice> r2 = new Vertex<>(
            new CiscoDevice("cisco-2", "core-rtr-02", "10.0.0.2", "IOS-XE 17.6"));
        Vertex<CiscoDevice> sw = new Vertex<>(
            new CiscoDevice("cisco-3", "edge-sw-01",  "10.0.1.1", "IOS-XE 17.3"));

        // --- ServiceNow records ---
        Instant now = Instant.now();
        Vertex<ServiceNowRecord> app = new Vertex<>(
            new ServiceNowRecord("sn-100", "billing-app", "application",
                now.minus(2, ChronoUnit.HOURS)));
        Vertex<ServiceNowRecord> srv = new Vertex<>(
            new ServiceNowRecord("sn-101", "billing-host-01", "server",
                now.minus(15, ChronoUnit.MINUTES)));

        // --- Print ---
        printVertex(r1);
        printVertex(r2);
        printVertex(sw);
        printVertex(srv);
        printVertex(app);

        // --- Prove dedup ---
        Vertex<CiscoDevice> r1Again = new Vertex<>(
            new CiscoDevice("cisco-1", "core-rtr-01-renamed", "10.0.0.1", "IOS-XE 17.6"));
        Set<Vertex<?>> all = new HashSet<>();
        all.add(r1); all.add(r2); all.add(sw); all.add(srv); all.add(app);
        all.add(r1Again);          // different hostname, same id+type → same vertex id
        System.out.printf("unique vertices: %d (expected 5)%n", all.size());
    }

    private static void printVertex(Vertex<? extends Resource> v) {
        Resource p = v.getPayload();
        System.out.printf("%-32s seen=%s%n", v.getId(), p.getLastSeen());
    }
}
`,
            },
          ],
        },
      ],
    },
    {
      id: 'phase-2',
      index: 2,
      title: 'Inheritance & Interfaces',
      subtitle: 'The Super Collector',
      difficulty: 'mid',
      sourceRef:
        'general-knowlegde/projects/nexus-route-topology-simulator/phase2-inheritance-and-interfaces.md',
      concepts: ['template-method'],
      overview: phase2Md,
      runInstructions: phase2Run,
      tasks: [
        {
          id: 'super-collector',
          title: 'Implement the abstract BaseCollector',
          concepts: ['template-method'],
          brief: `
> 🧠 **Concept — Template Method**
>
> Every collector does the same dance: connect → fetch → validate → enqueue → close. Only **fetch** really differs per source. Write the dance *once* in the base class — the **template** — and let subclasses fill only the variable step.
>
> - ✅ \`run()\` is \`final\` — subclasses cannot break the lifecycle
> - ✅ \`fetch()\` is \`abstract\` — subclasses **must** provide it
> - ❌ Two subclasses copy-pasting \`run()\` and tweaking it — that's not template method, that's duplication
>
> Two things at once: **lifecycle correctness** (cleanup always happens, in order) and **per-source freedom** (anyone can write a new collector without touching the base).
>
> Mental model: the base owns the *shape* of the algorithm; subclasses own the *holes*.

Build \`BaseCollector<T extends Resource>\` with a \`final run()\` template.
Then build \`CiscoCollector\` and \`ServiceNowCollector\` — each ~30 lines,
each overriding only \`fetch()\`.

**Smell test.** If you find yourself copying lines from \`CiscoCollector.run()\`
into \`ServiceNowCollector.run()\`, stop. The template should already cover it.
`,
          samples: [
            {
              filename: 'BaseCollector.java',
              language: 'java',
              starter: `package collector;

import java.util.List;
import java.util.concurrent.BlockingQueue;
import model.Resource;

public abstract class BaseCollector<T extends Resource> implements Runnable {
    protected final BlockingQueue<T> sink;
    protected BaseCollector(BlockingQueue<T> sink) { this.sink = sink; }

    // TODO: final run() — the template
    // TODO: abstract connect(), fetch(); virtual validate(), close()
}
`,
              reference: `package collector;

import java.util.List;
import java.util.concurrent.BlockingQueue;
import model.Resource;

public abstract class BaseCollector<T extends Resource> implements Runnable {
    protected final BlockingQueue<T> sink;
    protected BaseCollector(BlockingQueue<T> sink) { this.sink = sink; }

    @Override
    public final void run() {
        try {
            connect();
            for (T item : fetch()) {
                if (validate(item)) sink.put(item);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            close();
        }
    }

    protected abstract void connect();
    protected abstract List<T> fetch();
    protected boolean validate(T item) { return item != null; }
    protected void close() { /* default: no-op */ }
}
`,
            },
          ],
        },
        {
          id: 'cisco-collector',
          title: 'Build CiscoCollector',
          concepts: ['template-method'],
          brief: `
A concrete \`BaseCollector<CiscoDevice>\`. It "connects" to a fake SSH
endpoint and "fetches" a hard-coded list of devices. The point isn't the
network call — it's that subclassing the template required writing only
\`connect()\` and \`fetch()\`. Lifecycle, validation, queueing — all
inherited.

**Constraint.** Don't override \`run()\`. If you feel like you need to,
the template is wrong.
`,
          samples: [
            {
              filename: 'CiscoCollector.java',
              language: 'java',
              starter: `package collector;

import java.util.List;
import java.util.concurrent.BlockingQueue;
import model.CiscoDevice;

public class CiscoCollector extends BaseCollector<CiscoDevice> {
    private final String host;

    public CiscoCollector(BlockingQueue<CiscoDevice> sink, String host) {
        super(sink);
        this.host = host;
    }

    // TODO: connect() — pretend to open SSH
    // TODO: fetch()   — return a small fixed list
}
`,
              reference: `package collector;

import java.util.List;
import java.util.concurrent.BlockingQueue;
import model.CiscoDevice;

public class CiscoCollector extends BaseCollector<CiscoDevice> {
    private final String host;

    public CiscoCollector(BlockingQueue<CiscoDevice> sink, String host) {
        super(sink);
        this.host = host;
    }

    @Override
    protected void connect() {
        System.out.println("[cisco] open ssh " + host);
    }

    @Override
    protected List<CiscoDevice> fetch() {
        return List.of(
            new CiscoDevice("cisco-1", "core-rtr-01", "10.0.0.1", "IOS-XE 17.6"),
            new CiscoDevice("cisco-2", "core-rtr-02", "10.0.0.2", "IOS-XE 17.6")
        );
    }

    @Override
    protected void close() {
        System.out.println("[cisco] close ssh " + host);
    }
}
`,
            },
          ],
        },
        {
          id: 'servicenow-collector',
          title: 'Build ServiceNowCollector',
          concepts: ['template-method'],
          brief: `
Second concrete collector — different payload type, same template. Its
\`fetch()\` returns \`ServiceNowRecord\`s. Notice you write **zero**
threading code. Notice the queue is properly typed for each collector
(\`BlockingQueue<ServiceNowRecord>\` here, \`BlockingQueue<CiscoDevice>\`
in the previous task).

If you find yourself wanting a single \`BlockingQueue<Resource>\` for both
— go ahead, that's exactly what \`Resource\` is for. Either way works.
`,
          samples: [
            {
              filename: 'ServiceNowCollector.java',
              language: 'java',
              starter: `package collector;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.BlockingQueue;
import model.ServiceNowRecord;

public class ServiceNowCollector extends BaseCollector<ServiceNowRecord> {
    private final String baseUrl;

    public ServiceNowCollector(BlockingQueue<ServiceNowRecord> sink, String baseUrl) {
        super(sink);
        this.baseUrl = baseUrl;
    }

    // TODO: connect(), fetch()
}
`,
              reference: `package collector;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.BlockingQueue;
import model.ServiceNowRecord;

public class ServiceNowCollector extends BaseCollector<ServiceNowRecord> {
    private final String baseUrl;

    public ServiceNowCollector(BlockingQueue<ServiceNowRecord> sink, String baseUrl) {
        super(sink);
        this.baseUrl = baseUrl;
    }

    @Override
    protected void connect() {
        System.out.println("[snow] GET " + baseUrl + "/api/now/table/cmdb_ci");
    }

    @Override
    protected List<ServiceNowRecord> fetch() {
        Instant now = Instant.now();
        return List.of(
            new ServiceNowRecord("sn-100", "billing-app",     "application", now),
            new ServiceNowRecord("sn-101", "billing-host-01", "server",      now)
        );
    }
}
`,
            },
          ],
        },
      ],
    },
    {
      id: 'phase-2.5',
      index: 2.5,
      title: 'Graph & LinkPolicy',
      subtitle: 'Where linking actually lives',
      difficulty: 'intermediate',
      sourceRef: 'mini-asm/apphome/content/nexus/phase-2.5.md',
      concepts: ['specification-pattern', 'testing'],
      overview: phase25Md,
      runInstructions: phase25Run,
      tasks: [
        {
          id: 'edge-record',
          title: 'Edge — undirected, immutable',
          concepts: ['testing'],
          brief: `
An edge is a *value*: two vertices, no identity of its own. Use a Java
\`record\` so equality and hashCode are generated for you, then **override
them** to make the edge undirected — \`Edge(a, b)\` must equal \`Edge(b, a)\`.

**Contract recap (write the test first):**

- \`new Edge(a, b)\` and \`new Edge(b, a)\` are equal.
- \`new Edge(a, a)\` throws \`IllegalArgumentException\` (no self-loops at
  the edge level).
- Both endpoints must be non-null; null throws \`NullPointerException\`.

Records make this short, but the *override* is the part that matters:
record-default equality compares fields positionally, which would treat
\`(a,b)\` and \`(b,a)\` as different. You're saying, *"my equality is set
equality, not pair equality."*
`,
          samples: [
            {
              filename: 'Edge.java',
              language: 'java',
              starter: `package graph;

import model.Resource;
import model.Vertex;

public record Edge(Vertex<? extends Resource> a, Vertex<? extends Resource> b) {
    // TODO: validate non-null + non-self-loop in compact constructor
    // TODO: override equals + hashCode for undirected equality
}
`,
              reference: `package graph;

import java.util.Objects;
import java.util.Set;
import model.Resource;
import model.Vertex;

public record Edge(Vertex<? extends Resource> a, Vertex<? extends Resource> b) {
    public Edge {
        Objects.requireNonNull(a, "a");
        Objects.requireNonNull(b, "b");
        if (a.equals(b)) {
            throw new IllegalArgumentException("self-loop: " + a.getId());
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Edge other)) return false;
        return Set.of(a, b).equals(Set.of(other.a, other.b));
    }

    @Override
    public int hashCode() {
        // Symmetric: order-independent.
        return a.hashCode() ^ b.hashCode();
    }
}
`,
            },
          ],
        },
        {
          id: 'link-policy',
          title: 'LinkPolicy — the Specification',
          concepts: ['specification-pattern'],
          brief: `
> 🧩 **Pattern in play — Specification**
>
> A \`LinkPolicy\` is a tiny interface with one method: *"can these two
> vertices be linked?"*. The Graph delegates the decision; the policy
> doesn't know about the graph. That separation is the whole point.
>
> - ✅ Add a new policy → no Graph change required (Open/Closed).
> - ✅ Test policies in isolation — no graph, no edges, just \`canLink\`.
> - ✅ Compose: \`policyA.and(policyB)\`, \`policyA.or(policyB)\`.

**Build:**

- The interface itself, with two static factories: \`SAME_TYPE_ONLY\` and
  \`ALLOW_ALL\`.
- A default method \`and\` that combines two policies (bonus, but the
  test for it is a one-liner).

**Test cases (write first):**

- \`SAME_TYPE_ONLY\` returns true for two CiscoDevices, false for
  Cisco↔ServiceNow.
- \`ALLOW_ALL\` returns true for any non-null pair.
- A composed policy returns true iff both inputs do.
`,
          samples: [
            {
              filename: 'LinkPolicy.java',
              language: 'java',
              starter: `package graph;

import model.Resource;
import model.Vertex;

@FunctionalInterface
public interface LinkPolicy {
    boolean canLink(Vertex<? extends Resource> a, Vertex<? extends Resource> b);

    // TODO: default \`and\` combinator
    // TODO: static SAME_TYPE_ONLY and ALLOW_ALL
}
`,
              reference: `package graph;

import model.Resource;
import model.Vertex;

@FunctionalInterface
public interface LinkPolicy {
    boolean canLink(Vertex<? extends Resource> a, Vertex<? extends Resource> b);

    default LinkPolicy and(LinkPolicy other) {
        return (a, b) -> this.canLink(a, b) && other.canLink(a, b);
    }

    LinkPolicy ALLOW_ALL = (a, b) -> true;

    LinkPolicy SAME_TYPE_ONLY = (a, b) ->
        a.getPayload().getType().equals(b.getPayload().getType());
}
`,
            },
          ],
        },
        {
          id: 'graph-host',
          title: 'Graph — the host that owns linking',
          concepts: ['specification-pattern', 'testing'],
          brief: `
The graph holds vertices and edges, and delegates the *can we link?*
decision to its \`LinkPolicy\`. Notice what Graph does **not** do:
mutate vertices, look at payloads, or know what types exist. It works in
terms of \`Vertex<?>\` and \`LinkPolicy\` only.

**Contract recap:**

- \`add(v)\` returns true iff the vertex was new.
- \`connect(a, b)\` throws \`IllegalArgumentException\` if either vertex
  isn't already in the graph (fail fast — bad call site).
- \`connect(a, b)\` returns false (silently) if the policy rejects.
- \`connect(a, b)\` and \`connect(b, a)\` are the same — second call returns
  false because the edge already exists.
- \`neighbours(v)\` returns an unmodifiable Set.

**Test discipline.** Use \`LinkPolicy.ALLOW_ALL\` in Graph tests so you
isolate Graph's invariants from policy logic. Test \`SAME_TYPE_ONLY\` in
its own test class.
`,
          samples: [
            {
              filename: 'Graph.java',
              language: 'java',
              starter: `package graph;

import java.util.*;
import model.Resource;
import model.Vertex;

public final class Graph {
    private final Set<Vertex<?>> vertices = new HashSet<>();
    private final Set<Edge>      edges    = new HashSet<>();
    private final LinkPolicy     policy;

    public Graph(LinkPolicy policy) {
        this.policy = Objects.requireNonNull(policy);
    }

    public boolean add(Vertex<? extends Resource> v) {
        // TODO
        return false;
    }

    public boolean connect(Vertex<? extends Resource> a, Vertex<? extends Resource> b) {
        // TODO: validate, consult policy, store edge
        return false;
    }

    public Set<Vertex<?>> neighbours(Vertex<? extends Resource> v) {
        // TODO
        return Set.of();
    }

    public int size() { return vertices.size(); }
}
`,
              reference: `package graph;

import java.util.*;
import model.Resource;
import model.Vertex;

public final class Graph {
    private final Set<Vertex<?>> vertices = new HashSet<>();
    private final Set<Edge>      edges    = new HashSet<>();
    private final LinkPolicy     policy;

    public Graph(LinkPolicy policy) {
        this.policy = Objects.requireNonNull(policy, "policy");
    }

    public boolean add(Vertex<? extends Resource> v) {
        return vertices.add(Objects.requireNonNull(v, "vertex"));
    }

    public boolean connect(Vertex<? extends Resource> a, Vertex<? extends Resource> b) {
        Objects.requireNonNull(a, "a");
        Objects.requireNonNull(b, "b");
        if (!vertices.contains(a) || !vertices.contains(b)) {
            throw new IllegalArgumentException(
                "vertex not in graph: " +
                (vertices.contains(a) ? b.getId() : a.getId()));
        }
        if (a.equals(b))                    return false;     // no self-loop
        if (!policy.canLink(a, b))          return false;     // policy rejects
        return edges.add(new Edge(a, b));                     // false if duplicate
    }

    public Set<Vertex<?>> neighbours(Vertex<? extends Resource> v) {
        Objects.requireNonNull(v, "vertex");
        Set<Vertex<?>> out = new HashSet<>();
        for (Edge e : edges) {
            if (e.a().equals(v))      out.add(e.b());
            else if (e.b().equals(v)) out.add(e.a());
        }
        return Collections.unmodifiableSet(out);
    }

    public int size() { return vertices.size(); }
}
`,
            },
          ],
        },
        {
          id: 'graph-demo',
          title: 'Demo — wire it up',
          concepts: ['specification-pattern'],
          brief: `
Reuse the seed from Phase 1: 3 Cisco devices, 2 ServiceNow records. Put
all 5 into a \`Graph\` with \`LinkPolicy.SAME_TYPE_ONLY\`. Try every pair.
Print \`graph.neighbours(v)\` for each vertex.

**What you should see.**

- Cisco↔Cisco edges form. Cisco↔ServiceNow attempts return \`false\` and
  no edge appears.
- Calling \`connect(a, b)\` then \`connect(b, a)\` is idempotent — second
  call returns \`false\`.
- Swap the policy to \`ALLOW_ALL\`. Now all pairs link. The graph code
  didn't change. Neither did the vertex code. **Only the policy changed.**

That last sentence is the design lesson. Internalise it.
`,
          samples: [
            {
              filename: 'GraphDemo.java',
              language: 'java',
              starter: `package graph;

public class GraphDemo {
    public static void main(String[] args) {
        // TODO: build graph with SAME_TYPE_ONLY
        // TODO: add 5 vertices, try every pair
        // TODO: print neighbours
    }
}
`,
              reference: `package graph;

import java.time.Instant;
import java.util.List;
import model.CiscoDevice;
import model.ServiceNowRecord;
import model.Vertex;

public class GraphDemo {
    public static void main(String[] args) {
        Vertex<CiscoDevice> r1 = new Vertex<>(
            new CiscoDevice("cisco-1", "core-rtr-01", "10.0.0.1", "IOS-XE"));
        Vertex<CiscoDevice> r2 = new Vertex<>(
            new CiscoDevice("cisco-2", "core-rtr-02", "10.0.0.2", "IOS-XE"));
        Vertex<CiscoDevice> sw = new Vertex<>(
            new CiscoDevice("cisco-3", "edge-sw-01",  "10.0.1.1", "IOS-XE"));
        Vertex<ServiceNowRecord> app = new Vertex<>(
            new ServiceNowRecord("sn-100", "billing-app", "application", Instant.now()));
        Vertex<ServiceNowRecord> srv = new Vertex<>(
            new ServiceNowRecord("sn-101", "billing-host", "server",   Instant.now()));

        Graph g = new Graph(LinkPolicy.SAME_TYPE_ONLY);
        List<Vertex<?>> all = List.of(r1, r2, sw, app, srv);
        all.forEach(g::add);

        // every pair
        for (int i = 0; i < all.size(); i++) {
            for (int j = i + 1; j < all.size(); j++) {
                boolean linked = g.connect(all.get(i), all.get(j));
                System.out.printf("%s <-> %s : %s%n",
                    all.get(i).getId(), all.get(j).getId(),
                    linked ? "linked" : "rejected");
            }
        }

        System.out.println();
        for (Vertex<?> v : all) {
            System.out.printf("%s neighbours = %s%n", v.getId(), g.neighbours(v));
        }
    }
}
`,
            },
          ],
        },
      ],
    },
    {
      id: 'phase-3',
      index: 3,
      title: 'Concurrency & Collections',
      subtitle: 'Thread-safe topology map',
      difficulty: 'advanced',
      sourceRef:
        'general-knowlegde/projects/nexus-route-topology-simulator/phase3-concurrency-and-collections.md',
      concepts: ['race-conditions', 'deadlocks'],
      overview: phase3Md,
      runInstructions: phase3Run,
      tasks: [
        {
          id: 'topology-map',
          title: 'Race-free topology map',
          concepts: ['race-conditions'],
          brief: `
> 🧠 **Concept — Atomic vs Check-Then-Act**
>
> Two threads can both run \`if (!map.containsKey(id))\` *at the same time*, both see "no", both call \`put\`, and one silently overwrites the other. The check and the act are separate steps and the JVM is free to interleave them.
>
> - ✅ \`map.computeIfAbsent(id, k -> new Vertex<>(r))\` — one atomic operation
> - ✅ \`map.merge(id, v, mergeFn)\` — atomic insert-or-combine
> - ❌ \`if (!map.containsKey(id)) map.put(id, v)\` — two operations, race waiting to happen
>
> Two things at once: \`ConcurrentHashMap\` gives **non-blocking reads** *and* **atomic compound operations**. Plain \`HashMap\` gives neither; \`Collections.synchronizedMap\` gives the second only by serialising everything.
>
> Mental model: if your logic looks like *"check the map, then change it"*, that pair must happen as **one** call — not two.

Wrap a \`ConcurrentHashMap<String, Vertex<? extends Resource>>\` in a
\`Topology\` class. Expose \`upsert(Resource)\` that **never** has a
check-then-act race.

**Trap to avoid.** \`if (!map.containsKey(id)) map.put(id, ...)\` — racy.
Use \`computeIfAbsent\`.
`,
          samples: [
            {
              filename: 'Topology.java',
              language: 'java',
              starter: `package manager;

import java.util.concurrent.ConcurrentHashMap;
import model.*;

public class Topology {
    private final ConcurrentHashMap<String, Vertex<? extends Resource>> map = new ConcurrentHashMap<>();

    public <T extends Resource> Vertex<T> upsert(T r) {
        // TODO: race-free
        return null;
    }
}
`,
              reference: `package manager;

import java.util.concurrent.ConcurrentHashMap;
import model.*;

public class Topology {
    private final ConcurrentHashMap<String, Vertex<? extends Resource>> map = new ConcurrentHashMap<>();

    @SuppressWarnings("unchecked")
    public <T extends Resource> Vertex<T> upsert(T r) {
        return (Vertex<T>) map.computeIfAbsent(r.getId(), k -> new Vertex<>(r));
    }

    public int size() { return map.size(); }
}
`,
            },
          ],
        },
        {
          id: 'safe-linker',
          title: 'Lossless edge linking',
          concepts: ['race-conditions'],
          brief: `
\`upsert\` is safe but \`vertex.link(other)\` is not — two threads linking
the same vertex can lose neighbours if \`Vertex\` uses a plain
\`ArrayList\` internally.

**Two routes, pick one.**
1. Make \`Vertex.neighbours\` a \`CopyOnWriteArrayList\` — perfect when reads
   massively outnumber writes.
2. Synchronise \`link()\` on the vertex itself.

Add a \`Linker\` helper that does both ends of a bidirectional link
atomically. Lock both vertices in a globally consistent order (low id
first) — a foreshadowing of Phase 6.
`,
          samples: [
            {
              filename: 'Linker.java',
              language: 'java',
              starter: `package manage;

import model.*;

public class Linker {
    public void connect(Vertex<? extends Resource> a, Vertex<? extends Resource> b) {
        // TODO: bidirectional link without losing neighbours under contention
    }
}
`,
              reference: `package manage;

import model.*;

public class Linker {
    public void connect(Vertex<? extends Resource> a, Vertex<? extends Resource> b) {
        Vertex<? extends Resource> first  =
            a.getPayload().getId().compareTo(b.getPayload().getId()) <= 0 ? a : b;
        Vertex<? extends Resource> second = first == a ? b : a;
        synchronized (first) {
            synchronized (second) {
                a.link(b);
                b.link(a);
            }
        }
    }
}
`,
            },
          ],
        },
        {
          id: 'topology-stats',
          title: 'Non-blocking stats snapshot',
          concepts: ['race-conditions'],
          brief: `
Add \`Topology.stats()\` — count vertices per type and report the freshest
\`lastSeen\` per type. **Must not** block writers. \`ConcurrentHashMap\`'s
weakly-consistent iterators are fine here — you'll see a slightly
out-of-date snapshot, never a corrupted one.
`,
          samples: [
            {
              filename: 'Stats.java',
              language: 'java',
              starter: `package manage;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import model.*;

public class Stats {
    private final Topology topology;
    public Stats(Topology topology) { this.topology = topology; }

    public Map<String, Integer> countsByType() {
        // TODO: walk topology, count without locking
        return Map.of();
    }
}
`,
              reference: `package manage;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import model.*;

public class Stats {
    private final Topology topology;
    public Stats(Topology topology) { this.topology = topology; }

    public Map<String, Integer> countsByType() {
        ConcurrentHashMap<String, Integer> counts = new ConcurrentHashMap<>();
        for (Vertex<? extends Resource> v : topology.values()) {
            counts.merge(v.getPayload().getType(), 1, Integer::sum);
        }
        return counts;
    }
}
`,
            },
          ],
        },
      ],
    },
    {
      id: 'phase-3.5',
      index: 3.5,
      title: 'ExecutorService',
      subtitle: 'From manual threads to a managed pool',
      difficulty: 'advanced',
      sourceRef:
        'general-knowlegde/projects/nexus-route-topology-simulator/phase3.5-executorservice.md',
      concepts: ['executor-service'],
      overview: phase35Md,
      runInstructions: phase35Run,
      tasks: [
        {
          id: 'pool-runner',
          title: 'Run collectors on a fixed pool',
          concepts: ['executor-service'],
          brief: `
> 🧠 **Concept — Threads vs Pools**
>
> A \`Thread\` is an OS-level resource. Creating one per task is expensive and unbounded — flood your app with tasks and you flood the OS with threads. An \`ExecutorService\` decouples *task* from *worker*: you submit work, the pool picks an idle worker.
>
> - ✅ \`Executors.newFixedThreadPool(8)\` — bounded workers, queued tasks
> - ✅ \`pool.submit(runnable)\` — returns a \`Future\`, exception-aware
> - ❌ \`new Thread(r).start()\` in a loop — no bound, no naming, no error handling
>
> Two things at once: a pool gives you **resource control** (cap concurrency) and **lifecycle hooks** (named threads, uncaught-exception handlers, graceful shutdown).
>
> Mental model: tasks are *jobs to do*; threads are *workers*. The pool is the agency that matches them.

Submit each collector via an \`ExecutorService\`. Add a thread factory that
names threads \`collector-N\` and an uncaught-exception handler that logs
instead of swallowing. Implement graceful shutdown.
`,
          samples: [
            {
              filename: 'CollectorRunner.java',
              language: 'java',
              starter: `package manager;

import java.util.List;
import java.util.concurrent.*;
import collector.BaseCollector;

public class CollectorRunner {
    public void run(List<BaseCollector<?>> collectors) {
        // TODO: build a named pool, submit, await, shutdown
    }
}
`,
              reference: `package manager;

import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import collector.BaseCollector;

public class CollectorRunner {
    public void run(List<BaseCollector<?>> collectors) throws InterruptedException {
        AtomicInteger n = new AtomicInteger();
        ExecutorService pool = Executors.newFixedThreadPool(
            Math.min(8, collectors.size()),
            r -> {
                Thread t = new Thread(r, "collector-" + n.incrementAndGet());
                t.setUncaughtExceptionHandler((th, ex) ->
                    System.err.println(th.getName() + " died: " + ex));
                return t;
            });
        collectors.forEach(pool::submit);
        pool.shutdown();
        if (!pool.awaitTermination(30, TimeUnit.SECONDS)) pool.shutdownNow();
    }
}
`,
            },
          ],
        },
        {
          id: 'scheduled-runner',
          title: 'Re-run collectors on a schedule with backoff',
          concepts: ['executor-service'],
          brief: `
A real collector runs *forever*, not once. Use a
\`ScheduledExecutorService\` to invoke each collector every 30 seconds.
On failure, double the delay up to a cap — exponential backoff prevents
a flaky source from melting the pool with retries.

**Trap to avoid.** \`scheduleAtFixedRate\` will start *overlapping*
invocations if a run takes longer than the period. Use
\`scheduleWithFixedDelay\` so the next run starts only after the previous
finishes.
`,
          samples: [
            {
              filename: 'ScheduledRunner.java',
              language: 'java',
              starter: `package manager;

import java.time.Duration;
import java.util.concurrent.*;
import collector.BaseCollector;

public class ScheduledRunner {
    public void scheduleEvery(BaseCollector<?> collector, Duration interval) {
        // TODO: scheduleWithFixedDelay + per-collector backoff on failure
    }
}
`,
              reference: `package manager;

import java.time.Duration;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicLong;
import collector.BaseCollector;

public class ScheduledRunner {
    private final ScheduledExecutorService pool =
        Executors.newScheduledThreadPool(4);

    public void scheduleEvery(BaseCollector<?> collector, Duration interval) {
        AtomicLong currentDelay = new AtomicLong(interval.toMillis());
        long maxDelay = interval.toMillis() * 16;

        Runnable wrapped = () -> {
            try {
                collector.run();
                currentDelay.set(interval.toMillis()); // reset on success
            } catch (RuntimeException ex) {
                long next = Math.min(currentDelay.get() * 2, maxDelay);
                currentDelay.set(next);
                System.err.println("collector failed, next attempt in " + next + "ms");
            }
        };
        pool.scheduleWithFixedDelay(wrapped,
            interval.toMillis(), interval.toMillis(), TimeUnit.MILLISECONDS);
    }

    public void shutdown() throws InterruptedException {
        pool.shutdown();
        if (!pool.awaitTermination(10, TimeUnit.SECONDS)) pool.shutdownNow();
    }
}
`,
            },
          ],
        },
      ],
    },
    {
      id: 'phase-4',
      index: 5,
      title: 'JDBC & Persistence',
      subtitle: 'Stop losing data on restart',
      difficulty: 'advanced',
      sourceRef:
        'general-knowlegde/projects/nexus-route-topology-simulator/phase4-jdbc-and-persistence.md',
      concepts: ['connection-pooling'],
      overview: phase4Md,
      runInstructions: phase4Run,
      tasks: [
        {
          id: 'datasource-config',
          title: 'Configure a HikariCP DataSource',
          concepts: ['connection-pooling'],
          brief: `
Build a small factory that returns a \`HikariDataSource\`. Apply the rules
from the **Connection Pooling** concept: bounded \`maximumPoolSize\`, fast
\`connectionTimeout\`, leak detection on, \`maxLifetime\` shorter than the
DB's idle-kill.

**Pitfall.** Resist the urge to set \`maximumPoolSize\` to 50. The DB has a
finite \`max_connections\`; multiply by your replicas before picking a number.
`,
          samples: [
            {
              filename: 'DataSourceFactory.java',
              language: 'java',
              starter: `package db;

import com.zaxxer.hikari.*;
import javax.sql.DataSource;

public class DataSourceFactory {
    public static DataSource create(String url, String user, String pw) {
        // TODO: build HikariConfig with sensible defaults, return DataSource
        return null;
    }
}
`,
              reference: `package db;

import com.zaxxer.hikari.*;
import javax.sql.DataSource;

public class DataSourceFactory {
    public static DataSource create(String url, String user, String pw) {
        HikariConfig cfg = new HikariConfig();
        cfg.setJdbcUrl(url);
        cfg.setUsername(user);
        cfg.setPassword(pw);
        cfg.setMaximumPoolSize(10);
        cfg.setMinimumIdle(2);
        cfg.setConnectionTimeout(3_000);
        cfg.setIdleTimeout(600_000);
        cfg.setMaxLifetime(1_800_000);
        cfg.setLeakDetectionThreshold(20_000);
        cfg.setPoolName("topology-pool");
        return new HikariDataSource(cfg);
    }
}
`,
            },
          ],
        },
        {
          id: 'upsert-dao',
          title: 'Race-free UPSERT DAO',
          concepts: ['connection-pooling', 'race-conditions'],
          brief: `
Write \`ResourceDao.upsert(Resource)\`. Use Postgres's
\`INSERT ... ON CONFLICT (id) DO UPDATE\` so two collectors discovering the
same resource simultaneously can't corrupt each other.

**Why not SELECT-then-INSERT-or-UPDATE?** Classic check-then-act race — the
database will not save you from logic split across two round trips.
`,
          samples: [
            {
              filename: 'ResourceDao.java',
              language: 'java',
              starter: `package db;

import javax.sql.DataSource;
import java.sql.*;
import model.Resource;

public class ResourceDao {
    private final DataSource ds;
    public ResourceDao(DataSource ds) { this.ds = ds; }

    public void upsert(Resource r, String json) throws SQLException {
        // TODO: single SQL statement, ON CONFLICT DO UPDATE,
        //       always use try-with-resources
    }
}
`,
              reference: `package db;

import javax.sql.DataSource;
import java.sql.*;
import model.Resource;

public class ResourceDao {
    private static final String UPSERT = """
        INSERT INTO resources (id, type, name, data, last_seen, status)
        VALUES (?, ?, ?, ?::jsonb, NOW(), 'ACTIVE')
        ON CONFLICT (id) DO UPDATE SET
            type      = EXCLUDED.type,
            name      = EXCLUDED.name,
            data      = EXCLUDED.data,
            last_seen = NOW(),
            status    = 'ACTIVE'
        """;

    private final DataSource ds;
    public ResourceDao(DataSource ds) { this.ds = ds; }

    public void upsert(Resource r, String json) throws SQLException {
        try (Connection c = ds.getConnection();
             PreparedStatement ps = c.prepareStatement(UPSERT)) {
            ps.setString(1, r.getId());
            ps.setString(2, r.getType());
            ps.setString(3, r.getId()); // name == id in this demo
            ps.setString(4, json);
            ps.executeUpdate();
        }
    }
}
`,
            },
          ],
        },
        {
          id: 'stale-sweeper',
          title: 'TTL sweeper for stale resources',
          concepts: ['connection-pooling'],
          brief: `
Resources you stop hearing about should age out — not stay \`ACTIVE\`
forever just because the row exists. Build a periodic sweeper that flips
\`status\` to \`STALE\` for any resource whose \`last_seen\` is older than
some TTL.

**Why one UPDATE, not select-then-update?** Same race-free reasoning as
the upsert: keep state changes inside a single SQL statement so the DB
can serialise them.
`,
          samples: [
            {
              filename: 'StaleSweeper.java',
              language: 'java',
              starter: `package db;

import javax.sql.DataSource;
import java.sql.*;
import java.time.Duration;

public class StaleSweeper {
    private final DataSource ds;
    private final Duration ttl;

    public StaleSweeper(DataSource ds, Duration ttl) {
        this.ds = ds;
        this.ttl = ttl;
    }

    /** Returns the number of rows just marked STALE. */
    public int sweep() throws SQLException {
        // TODO: one UPDATE that flips ACTIVE -> STALE when last_seen too old
        return 0;
    }
}
`,
              reference: `package db;

import javax.sql.DataSource;
import java.sql.*;
import java.time.Duration;

public class StaleSweeper {
    private static final String SQL = """
        UPDATE resources
           SET status = 'STALE'
         WHERE status = 'ACTIVE'
           AND last_seen < NOW() - (? || ' seconds')::interval
        """;

    private final DataSource ds;
    private final Duration ttl;

    public StaleSweeper(DataSource ds, Duration ttl) {
        this.ds = ds;
        this.ttl = ttl;
    }

    public int sweep() throws SQLException {
        try (Connection c = ds.getConnection();
             PreparedStatement ps = c.prepareStatement(SQL)) {
            ps.setString(1, String.valueOf(ttl.toSeconds()));
            return ps.executeUpdate();
        }
    }
}
`,
            },
          ],
        },
      ],
    },
    {
      id: 'phase-4.5',
      index: 6,
      title: 'Dropwizard HTTP API',
      subtitle: 'Wire the topology store to the network',
      difficulty: 'mid',
      sourceRef:
        'general-knowlegde/projects/nexus-route-topology-simulator/phase4.5-dropwizard-api.md',
      concepts: ['dropwizard'],
      overview: phase45Md,
      runInstructions: phase45Run,
      tasks: [
        {
          id: 'dw-configuration',
          title: 'Define TopologyConfiguration',
          concepts: ['dropwizard'],
          brief: `
Dropwizard deserialises your YAML file into a typed Java object. Define
\`TopologyConfiguration extends Configuration\` with a
\`@Valid @NotNull DataSourceFactory database\` field so Dropwizard's
built-in Hibernate Validator rejects a broken config before the server
ever starts.

**Why this matters.** A misconfigured pool URL crashes the app on the
first request, not at startup — you'll debug it in production. Typed
configuration fails *fast*, at the right moment, with a clear message.
`,
          samples: [
            {
              filename: 'TopologyConfiguration.java',
              language: 'java',
              starter: `package topology;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.dropwizard.core.Configuration;
import io.dropwizard.db.DataSourceFactory;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public class TopologyConfiguration extends Configuration {
    // TODO: add a DataSourceFactory field named 'database'
    //       annotated @Valid @NotNull
    //       with a @JsonProperty getter and setter
}
`,
              reference: `package topology;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.dropwizard.core.Configuration;
import io.dropwizard.db.DataSourceFactory;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public class TopologyConfiguration extends Configuration {
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
          id: 'dw-application',
          title: 'Wire the Application class',
          concepts: ['dropwizard'],
          brief: `
> 🧠 **Concept — Dropwizard Application**
>
> The \`Application\` class is your entire wiring manifest. Everything that
> exists in your service is registered here — resources, health checks,
> managed objects, bundles. If it isn't registered, it doesn't exist.
>
> - ✅ Register the \`DataSource\` as a \`ManagedDataSource\` so Dropwizard
>   starts and stops the pool with the lifecycle
> - ✅ Register your \`Resource\` and \`HealthCheck\` in \`run()\`
> - ❌ Instantiate dependencies inside resources — inject them through the
>   constructor; resources are instantiated once, not per-request
>
> Mental model: \`initialize()\` wires the *framework* (bundles, commands);
> \`run()\` wires your *application* (resources, health checks, managed objects).

Build \`TopologyApplication extends Application<TopologyConfiguration>\`.
In \`run()\`: build a \`ManagedDataSource\` from the config, register it with
the lifecycle, construct your \`TopologyResource\` and \`DbHealthCheck\`,
and register both.
`,
          samples: [
            {
              filename: 'TopologyApplication.java',
              language: 'java',
              starter: `package topology;

import io.dropwizard.core.Application;
import io.dropwizard.core.setup.Bootstrap;
import io.dropwizard.core.setup.Environment;

public class TopologyApplication extends Application<TopologyConfiguration> {

    public static void main(String[] args) throws Exception {
        new TopologyApplication().run(args);
    }

    @Override
    public void initialize(Bootstrap<TopologyConfiguration> bootstrap) {
        // TODO: register bundles (e.g. MigrationsBundle) here
    }

    @Override
    public void run(TopologyConfiguration config, Environment env) throws Exception {
        // TODO: build ManagedDataSource, register with lifecycle
        // TODO: build TopologyStore
        // TODO: register TopologyResource
        // TODO: register DbHealthCheck
    }
}
`,
              reference: `package topology;

import io.dropwizard.core.Application;
import io.dropwizard.core.setup.Bootstrap;
import io.dropwizard.core.setup.Environment;
import io.dropwizard.db.ManagedDataSource;
import topology.db.TopologyStore;
import topology.health.DbHealthCheck;
import topology.resource.TopologyResource;

public class TopologyApplication extends Application<TopologyConfiguration> {

    public static void main(String[] args) throws Exception {
        new TopologyApplication().run(args);
    }

    @Override
    public void initialize(Bootstrap<TopologyConfiguration> bootstrap) {}

    @Override
    public void run(TopologyConfiguration config, Environment env) throws Exception {
        // Build the pool and tie its lifecycle to the server's
        ManagedDataSource ds = config.getDatabase()
            .build(env.metrics(), "topology-db");
        env.lifecycle().manage(ds);

        TopologyStore store = new TopologyStore(ds);
        env.jersey().register(new TopologyResource(store));
        env.healthChecks().register("db", new DbHealthCheck(ds));
    }
}
`,
            },
          ],
        },
        {
          id: 'dw-resource',
          title: 'Build the TopologyResource',
          concepts: ['dropwizard'],
          brief: `
Build \`TopologyResource\` — a JAX-RS resource class using Jersey 3 /
Jakarta EE 10 namespaces. Expose two endpoints:

- \`GET  /topology/{id}\` — return the vertex as JSON; 404 if not found
- \`POST /topology\` — accept a JSON body, upsert into the store, return the stored vertex

**Dropwizard 5.1 reminder.** Import from \`jakarta.ws.rs.*\` — not the old
\`javax.ws.rs.*\`. The namespace rename is the #1 migration mistake when
moving from Dropwizard 2.x/4.x.
`,
          samples: [
            {
              filename: 'TopologyResource.java',
              language: 'java',
              starter: `package topology.resource;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import topology.db.TopologyStore;
import topology.model.TopologyVertex;

@Path("/topology")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TopologyResource {
    private final TopologyStore store;

    public TopologyResource(TopologyStore store) { this.store = store; }

    @GET
    @Path("/{id}")
    public TopologyVertex get(@PathParam("id") String id) {
        // TODO: look up vertex; throw NotFoundException if absent
        return null;
    }

    @POST
    public TopologyVertex upsert(TopologyVertex vertex) {
        // TODO: delegate to store.upsert and return the result
        return null;
    }
}
`,
              reference: `package topology.resource;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import topology.db.TopologyStore;
import topology.model.TopologyVertex;

@Path("/topology")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TopologyResource {
    private final TopologyStore store;

    public TopologyResource(TopologyStore store) { this.store = store; }

    @GET
    @Path("/{id}")
    public TopologyVertex get(@PathParam("id") String id) {
        return store.findById(id)
            .orElseThrow(() -> new NotFoundException("vertex not found: " + id));
    }

    @POST
    public TopologyVertex upsert(TopologyVertex vertex) {
        return store.upsert(vertex);
    }
}
`,
            },
          ],
        },
        {
          id: 'dw-healthcheck',
          title: 'Write a DbHealthCheck',
          concepts: ['dropwizard', 'health-checks'],
          brief: `
Dropwizard's \`/healthcheck\` endpoint is what load balancers, ops teams,
and Kubernetes liveness probes call. If it returns unhealthy, traffic stops.

Build \`DbHealthCheck extends HealthCheck\`. In \`check()\`: acquire a
connection, run \`SELECT 1\`, close everything. Return \`Result.healthy()\`
on success, \`Result.unhealthy(e)\` on any exception.

**Do not throw.** An uncaught exception in a health check shows up as an
internal error (not \`"healthy": false\`) — you lose the message in the
\`/healthcheck\` JSON response, making it much harder to diagnose.
`,
          samples: [
            {
              filename: 'DbHealthCheck.java',
              language: 'java',
              starter: `package topology.health;

import com.codahale.metrics.health.HealthCheck;
import javax.sql.DataSource;

public class DbHealthCheck extends HealthCheck {
    private final DataSource ds;

    public DbHealthCheck(DataSource ds) { this.ds = ds; }

    @Override
    protected Result check() throws Exception {
        // TODO: try SELECT 1; return healthy or unhealthy — never throw
        return Result.unhealthy("not implemented");
    }
}
`,
              reference: `package topology.health;

import com.codahale.metrics.health.HealthCheck;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

public class DbHealthCheck extends HealthCheck {
    private final DataSource ds;

    public DbHealthCheck(DataSource ds) { this.ds = ds; }

    @Override
    protected Result check() {
        try (Connection c = ds.getConnection();
             Statement  s = c.createStatement();
             ResultSet  r = s.executeQuery("SELECT 1")) {
            return r.next() ? Result.healthy() : Result.unhealthy("SELECT 1 returned no rows");
        } catch (Exception e) {
            return Result.unhealthy(e);
        }
    }
}
`,
            },
          ],
        },
      ],
    },
    {
      id: 'phase-5',
      index: 7,
      title: 'Kafka & Event-Driven',
      subtitle: 'Topology changes as a stream',
      difficulty: 'advanced',
      sourceRef:
        'general-knowlegde/projects/nexus-route-topology-simulator/phase5-kafka-event-driven.md',
      concepts: ['kafka-producer-consumer'],
      overview: phase5Md,
      runInstructions: phase5Run,
      tasks: [
        {
          id: 'kafka-producer',
          title: 'Idempotent producer, keyed by resource id',
          concepts: ['kafka-producer-consumer'],
          brief: `
> 🧠 **Concept — Keys, Partitions, and Order**
>
> Kafka guarantees order **within a partition**, not across the topic. The producer chooses partition by hashing the **key**. Same key → same partition → ordered.
>
> - ✅ \`new ProducerRecord<>(topic, resource.getId(), json)\` — all events for that resource land on one partition
> - ✅ Idempotent producer + \`acks=all\` — retries don't duplicate
> - ❌ \`new ProducerRecord<>(topic, json)\` — null key, round-robin, ordering lost
>
> Two things at once: a stable key gives you **per-entity ordering** *and* **scalable parallelism** — different keys hash to different partitions, consumed in parallel by group members.
>
> Mental model: the **key** is the unit of order. Pick something stable per entity (resource id, customer id) — never something that varies across writes.

Build \`TopologyEventProducer\` with idempotence enabled, \`acks=all\`, and
**resource id as the partition key**. Same resource → same partition →
ordered events for any consumer.

**Trap to avoid.** Don't pass \`null\` as key. That's round-robin and you
lose ordering for free.
`,
          samples: [
            {
              filename: 'TopologyEventProducer.java',
              language: 'java',
              starter: `package events;

import org.apache.kafka.clients.producer.*;
import java.util.Properties;

public class TopologyEventProducer implements AutoCloseable {
    private final KafkaProducer<String, String> producer;
    private static final String TOPIC = "topology.input.resources";

    public TopologyEventProducer(String bootstrap) {
        // TODO: configure idempotence + acks=all, build the producer
        this.producer = null;
    }

    public void publish(String resourceId, String json) {
        // TODO: send keyed by resourceId
    }

    @Override public void close() { /* TODO */ }
}
`,
              reference: `package events;

import org.apache.kafka.clients.producer.*;
import org.apache.kafka.common.serialization.StringSerializer;
import java.util.Properties;

public class TopologyEventProducer implements AutoCloseable {
    private final KafkaProducer<String, String> producer;
    private static final String TOPIC = "topology.input.resources";

    public TopologyEventProducer(String bootstrap) {
        Properties p = new Properties();
        p.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrap);
        p.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        p.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        p.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, "true");
        p.put(ProducerConfig.ACKS_CONFIG, "all");
        p.put(ProducerConfig.RETRIES_CONFIG, Integer.MAX_VALUE);
        p.put(ProducerConfig.MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION, 5);
        this.producer = new KafkaProducer<>(p);
    }

    public void publish(String resourceId, String json) {
        producer.send(new ProducerRecord<>(TOPIC, resourceId, json),
            (md, ex) -> { if (ex != null) ex.printStackTrace(); });
    }

    @Override public void close() { producer.flush(); producer.close(); }
}
`,
            },
          ],
        },
        {
          id: 'kafka-consumer',
          title: 'At-least-once consumer with manual commit',
          concepts: ['kafka-producer-consumer'],
          brief: `
Build \`TopologyEventConsumer\`. Disable auto-commit. Process the batch,
**then** \`commitSync()\`. If processing throws, **don't** commit — the
next poll will redeliver. Your downstream UPSERT makes redelivery safe.
`,
          samples: [
            {
              filename: 'TopologyEventConsumer.java',
              language: 'java',
              starter: `package events;

import org.apache.kafka.clients.consumer.*;
import java.time.Duration;
import java.util.*;

public class TopologyEventConsumer {
    public void runOnce(String bootstrap, java.util.function.BiConsumer<String,String> handler) {
        // TODO: build consumer with auto.commit=false, poll, process, commitSync
    }
}
`,
              reference: `package events;

import org.apache.kafka.clients.consumer.*;
import org.apache.kafka.common.serialization.StringDeserializer;
import java.time.Duration;
import java.util.*;

public class TopologyEventConsumer {
    public void runOnce(String bootstrap,
                        java.util.function.BiConsumer<String,String> handler) {
        Properties p = new Properties();
        p.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrap);
        p.put(ConsumerConfig.GROUP_ID_CONFIG, "topology-writer");
        p.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        p.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        p.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, "false");
        p.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");

        try (KafkaConsumer<String,String> c = new KafkaConsumer<>(p)) {
            c.subscribe(List.of("topology.input.resources"));
            ConsumerRecords<String,String> batch = c.poll(Duration.ofSeconds(5));
            for (ConsumerRecord<String,String> r : batch) {
                handler.accept(r.key(), r.value()); // must be idempotent!
            }
            c.commitSync(); // only after successful processing
        }
    }
}
`,
            },
          ],
        },
        {
          id: 'kafka-retry',
          title: 'Pause + seek instead of crashing',
          concepts: ['kafka-producer-consumer'],
          brief: `
Sometimes the downstream sink is *temporarily* unavailable — Postgres is
restarting, the network blipped. You don't want to crash the consumer
(rebalance storm), and you don't want to commit (data loss).

The Kafka-native answer: \`consumer.pause(partitions)\`, sleep with
backoff, then \`consumer.seek(partition, offset)\` back to the start of
the failed batch and resume.

Implement \`RetryingHandler.process(records)\` that retries the batch up
to N times with exponential backoff. If still failing, return false so
the caller can decide whether to skip-with-DLQ or shut down.
`,
          samples: [
            {
              filename: 'RetryingHandler.java',
              language: 'java',
              starter: `package events;

import org.apache.kafka.clients.consumer.ConsumerRecords;
import java.util.function.BiConsumer;

public class RetryingHandler {
    private final int maxAttempts;

    public RetryingHandler(int maxAttempts) { this.maxAttempts = maxAttempts; }

    /** Returns true on success, false if we ran out of retries. */
    public boolean process(ConsumerRecords<String,String> batch,
                           BiConsumer<String,String> sink) {
        // TODO: try sink.accept for each, retry whole batch with exponential
        //       backoff on RuntimeException, up to maxAttempts.
        return false;
    }
}
`,
              reference: `package events;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import java.util.function.BiConsumer;

public class RetryingHandler {
    private final int maxAttempts;

    public RetryingHandler(int maxAttempts) { this.maxAttempts = maxAttempts; }

    public boolean process(ConsumerRecords<String,String> batch,
                           BiConsumer<String,String> sink) {
        long backoff = 500;
        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                for (ConsumerRecord<String,String> r : batch) {
                    sink.accept(r.key(), r.value());
                }
                return true;
            } catch (RuntimeException ex) {
                System.err.println("attempt " + attempt + " failed: " + ex);
                if (attempt == maxAttempts) return false;
                try { Thread.sleep(backoff); }
                catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    return false;
                }
                backoff = Math.min(backoff * 2, 30_000);
            }
        }
        return false;
    }
}
`,
            },
          ],
        },
      ],
    },
    {
      id: 'phase-6',
      index: 8,
      title: 'Merge & Composite Resources',
      subtitle: 'Multiple sources, one truth',
      difficulty: 'advanced',
      sourceRef:
        'general-knowlegde/projects/nexus-route-topology-simulator/phase6-merge-and-composite-resources.md',
      concepts: ['deadlocks', 'provenance-and-merge'],
      overview: phase6Md,
      runInstructions: phase6Run,
      tasks: [
        {
          id: 'merge-strategy',
          title: 'Pluggable MergeStrategy interface',
          concepts: ['provenance-and-merge'],
          brief: `
Define a \`MergeStrategy\` interface with two methods: \`matches\` and
\`merge\`. Implement \`IpBasedMerge\` (matches by exact IP). Keep the engine
ignorant of strategy details — it should accept a list and try each in order.

**Why an interface and not an enum?** Strategies grow over time and may pull
in per-strategy state (caches, scoring weights). Keep the door open.
`,
          samples: [
            {
              filename: 'MergeStrategy.java',
              language: 'java',
              starter: `package merge;

import model.Resource;

public interface MergeStrategy {
    // TODO: matches(a,b), merge(a,b) -> CompositeResource
}
`,
              reference: `package merge;

import model.Resource;

public interface MergeStrategy {
    boolean matches(Resource a, Resource b);
    CompositeResource merge(Resource a, Resource b);
}

class IpBasedMerge implements MergeStrategy {
    @Override public boolean matches(Resource a, Resource b) {
        Object ipA = a.attribute("ip"), ipB = b.attribute("ip");
        return ipA != null && ipA.equals(ipB);
    }
    @Override public CompositeResource merge(Resource a, Resource b) {
        return CompositeResource.from(a).combine(b);
    }
}
`,
            },
          ],
        },
        {
          id: 'deadlock-free-merge',
          title: 'Deadlock-free pairwise lock',
          concepts: ['deadlocks'],
          brief: `
The merge engine must lock both vertices to swap them out for a composite.
Naïve approach: \`synchronized(a) { synchronized(b) { ... } }\`. If another
thread holds them in the opposite order — deadlock.

Apply **global lock ordering by id**. Always lock the lower id first.
`,
          samples: [
            {
              filename: 'MergeEngine.java',
              language: 'java',
              starter: `package merge;

import model.Resource;

public class MergeEngine {
    public CompositeResource mergePair(Resource a, Resource b, MergeStrategy strategy) {
        // TODO: lock a and b in a globally consistent order, then merge
        return null;
    }
}
`,
              reference: `package merge;

import model.Resource;

public class MergeEngine {
    public CompositeResource mergePair(Resource a, Resource b, MergeStrategy strategy) {
        Resource first  = a.getId().compareTo(b.getId()) <= 0 ? a : b;
        Resource second = first == a ? b : a;
        synchronized (first) {
            synchronized (second) {
                if (!strategy.matches(a, b)) return null;
                return strategy.merge(a, b);
            }
        }
    }
}
`,
            },
          ],
        },
        {
          id: 'composite-provenance',
          title: 'CompositeResource with per-attribute provenance',
          concepts: ['provenance-and-merge'],
          brief: `
> 🧠 **Concept — Provenance**
>
> A composite without provenance is just a flat map — you can't answer "where did this attribute come from?" Six months later, when the hostname is wrong, that's exactly what you'll need to know.
>
> - ✅ \`Map<String, ProvenancedValue>\` where each value carries its source set
> - ✅ Two sources agree → merge the source set, keep one value
> - ❌ Two sources disagree → silently overwrite — now the bug is invisible
>
> Two things at once: provenance gives you **debuggability** (every attribute is auditable) and **conflict detection** (disagreements show up as multi-source values you can flag).
>
> Mental model: every fact has a source. The composite isn't a list of facts; it's a list of *(fact, who-said-so)* pairs.

The composite is more than a union. For every attribute you need to know
*which source* contributed it. Without provenance, debugging "where did
this hostname come from?" is hopeless.

Build \`CompositeResource\`. Internally store
\`Map<String, ProvenancedValue>\` where \`ProvenancedValue\` carries the
value plus the *set of source ids* that asserted it.

When the same attribute appears from two sources with the **same** value,
merge the provenance set. When values *disagree*, prefer the more recent
source (\`lastSeen\` wins) but record both.
`,
          samples: [
            {
              filename: 'CompositeResource.java',
              language: 'java',
              starter: `package merge;

import java.time.Instant;
import java.util.*;
import model.Resource;

public class CompositeResource implements Resource {
    public record ProvenancedValue(Object value, Set<String> sources, Instant asOf) {}

    private final String id;
    private final Map<String, ProvenancedValue> attrs = new HashMap<>();

    public CompositeResource(String id) { this.id = id; }

    public static CompositeResource from(Resource r) {
        // TODO: seed from r.attributes() with sources={r.getId()}
        return new CompositeResource(r.getId());
    }

    public CompositeResource combine(Resource other) {
        // TODO: merge per attribute, recording provenance
        return this;
    }

    @Override public String  getId()       { return id; }
    @Override public String  getType()     { return "composite"; }
    @Override public Instant getLastSeen() { return Instant.now(); }
}
`,
              reference: `package merge;

import java.time.Instant;
import java.util.*;
import model.Resource;

public class CompositeResource implements Resource {
    public record ProvenancedValue(Object value, Set<String> sources, Instant asOf) {}

    private final String id;
    private final Map<String, ProvenancedValue> attrs = new HashMap<>();

    public CompositeResource(String id) { this.id = id; }

    public static CompositeResource from(Resource r) {
        CompositeResource c = new CompositeResource(r.getId());
        for (Map.Entry<String,Object> e : r.attributes().entrySet()) {
            c.attrs.put(e.getKey(),
                new ProvenancedValue(e.getValue(), Set.of(r.getType()), r.getLastSeen()));
        }
        return c;
    }

    public CompositeResource combine(Resource other) {
        for (Map.Entry<String,Object> e : other.attributes().entrySet()) {
            String k = e.getKey();
            Object v = e.getValue();
            ProvenancedValue existing = attrs.get(k);
            if (existing == null) {
                attrs.put(k, new ProvenancedValue(v, Set.of(other.getType()), other.getLastSeen()));
            } else if (Objects.equals(existing.value(), v)) {
                Set<String> merged = new LinkedHashSet<>(existing.sources());
                merged.add(other.getType());
                attrs.put(k, new ProvenancedValue(v, merged,
                    existing.asOf().isAfter(other.getLastSeen()) ? existing.asOf() : other.getLastSeen()));
            } else if (other.getLastSeen().isAfter(existing.asOf())) {
                Set<String> merged = new LinkedHashSet<>(existing.sources());
                merged.add(other.getType());
                attrs.put(k, new ProvenancedValue(v, merged, other.getLastSeen()));
            }
            // else: existing is newer, keep it
        }
        return this;
    }

    public Map<String, ProvenancedValue> attributesWithProvenance() {
        return Collections.unmodifiableMap(attrs);
    }

    @Override public String  getId()       { return id; }
    @Override public String  getType()     { return "composite"; }
    @Override public Instant getLastSeen() {
        return attrs.values().stream()
            .map(ProvenancedValue::asOf)
            .max(Comparator.naturalOrder())
            .orElse(Instant.now());
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
