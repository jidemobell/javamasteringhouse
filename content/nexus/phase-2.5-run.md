### Prerequisites

- Phase 1 (Resource + Vertex) compiles and tests pass
- Phase 2 collectors aren't required to run — Phase 2.5 is a pure
  in-memory step. You can do it standalone.

### Run it

```bash
cd nexus-phase-2.5
./gradlew test
```

No infra. No threads. No I/O. Just Java objects and JUnit. That's the
point — graph behaviour is *pure logic* and should be testable without
any of the moving parts that come later.

### What you'll write

- `src/main/java/graph/Edge.java`
- `src/main/java/graph/LinkPolicy.java` + `SameTypeOnly.java` + `AllowAll.java`
- `src/main/java/graph/Graph.java`
- `src/test/java/graph/GraphContractTest.java`
- `src/test/java/graph/LinkPolicyContractTest.java`

### Order to work in

1. `LinkPolicyContractTest` first — tests are tiny, the interface falls
   out naturally.
2. `Edge` — write the equality test (undirected: `Edge(a,b) == Edge(b,a)`)
   then make it pass.
3. `GraphContractTest` — one bullet from your contract per test method.
   Use `AllowAll` so Graph tests aren't entangled with policy logic.
4. `Graph` — implement until tests are green. Resist adding methods that
   no test asks for.

### What "done" looks like

- All contract tests green.
- `Vertex` is unchanged from Phase 1 — no `link()`, no `getNeighbours()`.
  If you needed to modify Vertex, you've put logic in the wrong place.
- A demo `main` that builds 5 vertices, connects them under
  `SameTypeOnly`, and prints `graph.neighbours(v)` for each.
