## How to use this platform

This isn't a video course or a textbook. It's a workshop. You build real
Java alongside markdown briefs, and the work itself teaches you the ideas.
Two minutes of orientation up front will save you a lot of confusion.

---

### The shape of a phase

Every phase has the same skeleton:

1. **Overview** — what this phase teaches and *why it matters in real
   systems*. A diagram shows where this phase fits in the bigger picture.
2. **Contract Document** *(new)* — before you write any code, you write
   a short prose contract for the class you're building. Bullets only.
3. **Tasks** — small, named units of work. Each has a brief, a starter
   file, and a "show solution" toggle.
4. **Run instructions** — the commands to actually compile and execute
   what you built.

You'll move between the brief on the left and the editor on the right.
Saving in the editor persists locally. Your progress is yours.

---

### The Contract Document — the most important habit

> **Before you write a single line of production code, write the contract.**

A contract is 3-7 plain English bullets describing what your class
*must* do and what it *must not* do. It's not pseudocode. It's not
implementation. It's the **decisions** you're making about behaviour.

Example, for a `Vertex<R>`:

```markdown
# Vertex Contract

## Invariants
- A vertex always has a non-null payload.
- A vertex's id is derived from its payload (id + type) — same payload
  in, same vertex id out.
- A vertex is immutable: payload cannot be replaced.

## Equality
- Two vertices are equal iff their ids are equal. Other fields don't
  participate.

## Explicitly NOT in scope (yet)
- Linking to other vertices. (That belongs to the graph layer.)
```

That document fits on a postcard. And every bullet maps directly to a
test method:

| Contract bullet | Test method |
|---|---|
| "Always has a non-null payload" | `payload_is_required` |
| "Id is derived from payload" | `vertex_id_is_derived_from_payload` |
| "Equal iff ids are equal" | `same_id_means_same_vertex` |

If you can't write a bullet without arguing with yourself, you've found
a design decision. **Make the decision, then write the bullet.** That's
the work. The code is downstream of it.

The pattern of writing contracts before code is sometimes called
**design by contract** or, when paired with tests-first,
**Test-Driven Development**. We have a whole concept page on it:
[Testing — Contracts, Not Code](concepts/testing).

---

### Test-first vs test-after — our stance

Both are valid. Here's the honest rule on this platform:

- **Recommended: write the test first.** It forces you to design the
  *outside* of the class before its *inside* — and that's where most
  architectural mistakes happen.
- **Acceptable: write the test after.** If the contract document is in
  place *first*, the order of (test, code) matters less.
- **Not acceptable: no contract, no test.** That's not a design — that's
  a guess.

You'll get the most out of this platform by trying the test-first
rhythm at least once. Even if you go back to test-after later, you'll
have felt what it's like to design from the outside in.

---

### Pattern callouts

You'll see boxes like this scattered through the briefs:

> 🧩 **Pattern in play — Template Method**
>
> The base class owns the lifecycle (`run()` is `final`); subclasses
> override only the variable step (`fetch()`). Why: the lifecycle is
> written once, correctly. New sources can't accidentally skip a step.
>
> See: [Template Method](concepts/template-method)

These are not decoration. They name the **classic design pattern**
the code is using, link you to a deeper page about it, and explain
*why this pattern fits this problem*. Two phases later, when you see
the same pattern in a different context, you'll recognise it and the
mental cost of new code drops sharply.

The patterns you'll meet in this platform:

| Pattern | First seen | Concept |
|---|---|---|
| Bounded Generics | Nexus P1 | [Generics & Wildcards](concepts/generics-wildcards) |
| Template Method | Nexus P2 | [Template Method](concepts/template-method) |
| Specification | Nexus P2.5 | (link will appear once concept is published) |
| Builder | Nexus P3 | [Builder Pattern](concepts/builder-pattern) |
| Producer/Consumer | Nexus P5 | [Kafka — Producer/Consumer Done Right](concepts/kafka-producer-consumer) |
| Strategy + Provenance | Nexus P6 | [Provenance & Merge](concepts/provenance-and-merge) |

---

### How concepts and tracks relate

- **Tracks** (Nexus, Mini-ASM) are the *journey*. They tell a story end
  to end.
- **Concepts** (Race Conditions, Template Method, Testing, …) are the
  *atoms*. Each one is a tight, focused write-up of a single idea.
- Every track phase **links into** the concepts it relies on. Every
  concept tells you **where it appears**.

If you find yourself confused mid-phase, the concept link is usually
the missing context.

---

### Recommended way through

If this is your first time:

1. Read this page (you're nearly done).
2. Skim the [Testing concept](concepts/testing) — 10 minutes.
3. Open Nexus → Phase 1.
4. **Read the Contract Document section first.** Try to fill in the
   contract bullets yourself before reading the suggested ones.
5. Write the test (or read the provided one and convince yourself
   each assertion maps to a contract bullet).
6. Write the code. Make the test pass.
7. Move to Phase 2. Repeat.

Don't skip the contract step, even when it feels redundant. The point
of this platform is the habit, not the code.

---

### Sidebar shortcuts

- **Home** — landing page with track summary.
- **Nexus / Mini-ASM** — the two tracks.
- **Concepts** — the cross-cutting library, browsable directly.

The progress widget at the bottom of the sidebar lets you export and
re-import your local progress as JSON. Useful when switching machines.

---

### One final thing

You will spend more time *reading and thinking* than typing. That's
correct. The hard part of mid-to-advanced Java isn't syntax — it's
**deciding what to build, how to draw boundaries between things, and
which decisions to freeze with a test**. The code itself is usually
twenty lines.

When in doubt: write the contract. If you can write the contract,
you understand the problem. The rest is mechanical.
