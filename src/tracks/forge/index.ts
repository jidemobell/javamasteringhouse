import type { Track } from '../../types';

import phase1Md from '../../../content/forge/phase-1.md?raw';
import phase2Md from '../../../content/forge/phase-2.md?raw';
import phase3Md from '../../../content/forge/phase-3.md?raw';
import phase4Md from '../../../content/forge/phase-4.md?raw';
import phase5Md from '../../../content/forge/phase-5.md?raw';
import phase1Run from '../../../content/forge/phase-1-run.md?raw';
import phase2Run from '../../../content/forge/phase-2-run.md?raw';
import phase3Run from '../../../content/forge/phase-3-run.md?raw';
import phase4Run from '../../../content/forge/phase-4-run.md?raw';
import phase5Run from '../../../content/forge/phase-5-run.md?raw';

// Track E — Forge (AI Tools & the Development Paradigm)
// Phased track teaching the paradigm of AI-assisted development: prompt
// contracts, the agent loop, reviewing AI output, and delegation boundaries.

export const forgeTrack: Track = {
  id: 'forge',
  name: 'Forge — AI Tools & the Development Paradigm',
  tagline:
    'Direct AI tools instead of typing every line. Prompts as contracts, the agent loop, review discipline, and what must stay human.',
  mode: 'phased',
  phases: [
    {
      id: 'phase-1',
      index: 1,
      title: 'The Paradigm Shift',
      subtitle: 'Definitions: assistants, agents, context, trust boundaries',
      difficulty: 'entry',
      sourceRef: 'general-knowlegde/ai-tools-paradigm/',
      concepts: ['agent-loop', 'trust-boundary'],
      overview: phase1Md,
      runInstructions: phase1Run,
      tasks: [
        {
          id: 'define-agent-loop',
          title: 'Define the agent loop in your own words',
          concepts: ['agent-loop'],
          brief: `
> 🧠 **Concept — The Agent Loop**
>
> Every AI coding tool runs the same skeleton: **Plan → Act → Verify → fix**.
> The tool fills the variable steps (edits); you own the skeleton (the loop
> itself). See [The Agent Loop](concepts/agent-loop).
>
> - ✅ The loop is the paradigm — everything else is detail
> - ✅ Verification is the step humans skip — and the one that matters
> - ❌ Treating the loop as "Plan → Act → trust me"

Write a definition of the agent loop **from memory** — no peeking. Then
compare with the reference. The point is to see which part of the loop your
first instinct leaves out (it's almost always *verify*).
`,
          samples: [
            {
              filename: 'agent-loop.md',
              language: 'markdown',
              starter: `# The Agent Loop

The agent loop is how AI coding tools get work done. It looks like:

1. 
2. 
3. 
4. 

In my own words, the loop means: 
`,
              reference: `# The Agent Loop

The agent loop is how AI coding tools get work done. It looks like:

1. **Plan** — the agent restates the task and proposes an approach
   (which files, which changes, which risks).
2. **Act** — it edits files, runs commands, and reads results.
3. **Verify** — it checks its own work against the acceptance criteria.
4. **Fix / Deliver** — if verification fails, it loops back to plan; if it
   passes, it presents the diff.

In my own words, the loop means: the machine fills in the variable steps
(the edits), but I own the skeleton — I write the task, review the plan,
re-run the verification myself, and decide when it's done. Skipping the
verify step is not delegation; it's delegation of my judgment.
`,
            },
          ],
        },
        {
          id: 'imperative-vs-delegation',
          title: 'Write the paradigm shift: imperative vs delegation',
          concepts: ['trust-boundary'],
          brief: `
The paradigm shift is a change of stance: from **transcribing** decisions
into code, to **specifying** decisions and verifying what comes back.

Fill in the table from the machine's point of view — what is the human doing
in each mode?
`,
          samples: [
            {
              filename: 'paradigm-shift.md',
              language: 'markdown',
              starter: `# Imperative vs Delegation

| | Imperative coding | Supervised delegation |
|---|---|---|
| Human spends time on | | |
| Machine spends time on | | |
| The skill that matters | | |
| Where errors appear | | |
| Where accountability lives | | |

The one-sentence version: 
`,
              reference: `# Imperative vs Delegation

| | Imperative coding | Supervised delegation |
|---|---|---|
| Human spends time on | typing code, fixing syntax | deciding intent, writing contracts, reviewing output |
| Machine spends time on | (nothing — you did it all) | the mechanical typing, the first drafts, the boilerplate |
| The skill that matters | language fluency | precision of intent + verification discipline |
| Where errors appear | where you typed | where the machine guessed — caught by your review |
| Where accountability lives | yours | still yours. The machine is never accountable. |

The one-sentence version: the bottleneck moved from typing speed to the
precision of your decisions — and the skill that pays is verifying, not
transcribing.
`,
            },
          ],
        },
        {
          id: 'workflow-audit',
          title: 'Audit your own workflow',
          concepts: ['trust-boundary'],
          brief: `
Take one real task you did recently — ideally something from the other
tracks on this platform. Write out its steps, then mark each step:
**A** = the machine could do it well today, **H** = it must stay human,
**M** = the machine could help but you should decide.

The value is not the list. It's noticing which steps you *assumed* were
human and are actually mechanical.
`,
          samples: [
            {
              filename: 'workflow-audit.md',
              language: 'markdown',
              starter: `# Workflow Audit

Task I'm auditing: 

| Step | What I did | A / H / M | Why |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |

Steps I was surprised to classify as delegatable (A or M):
`,
              reference: `# Workflow Audit

Task I'm auditing: "Build a TopologyVertex with a Builder" (Nexus P1)

| Step | What I did | A / H / M | Why |
|---|---|---|---|
| 1 | Read the brief and the contract bullets | H | Understanding the requirement is mine |
| 2 | Decide the class shape: final, immutable, builder | H | Architecture — the model can't see the course's intent |
| 3 | Write getters, constructor, builder methods | A | Mechanical transcription of a made decision |
| 4 | Write the contract test | M | I write the contract; the machine could transcribe assertions |
| 5 | Run the test and read the failure | H | Verification is mine — the self-report is a hypothesis |

Steps I was surprised to classify as delegatable (A or M): writing getters
and the builder plumbing — I always did it by hand and never once made a
decision there. That's exactly the kind of step delegation should take.
`,
            },
          ],
        },
      ],
    },
    {
      id: 'phase-2',
      index: 2,
      title: 'Prompts Are Contracts',
      subtitle: 'Intent, context, constraints, acceptance criteria',
      difficulty: 'mid',
      sourceRef: 'general-knowlegde/ai-tools-paradigm/prompts-as-contracts.md',
      concepts: ['prompt-spec', 'specification-pattern'],
      overview: phase2Md,
      runInstructions: phase2Run,
      tasks: [
        {
          id: 'rewrite-vague-prompt',
          title: 'Rewrite a vague prompt as a prompt-contract',
          concepts: ['prompt-spec'],
          brief: `
> 🧠 **Concept — Prompt Contract**
>
> A prompt is a spec, not a sentence. Four parts: **intent**, **context**,
> **constraints**, **acceptance criteria**. Miss the last one and you have a
> wish, not a contract. See [Prompts Are Contracts](concepts/prompt-spec).
>
> - ✅ Name what must *not* happen, not just what must
> - ✅ Define done with something checkable (a test, a command)
> - ❌ "Please implement X" — three interpretations, one confident guess

Rewrite the vague prompt below into a full prompt-contract. Keep all four
sections labelled.
`,
          samples: [
            {
              filename: 'prompt-contract.md',
              language: 'markdown',
              starter: `# Rewrite this

"Please make the login faster."

---

# Your prompt-contract

## Intent

## Context

## Constraints

## Acceptance criteria
`,
              reference: `# Prompt-contract: fail-fast login

## Intent
The login endpoint currently blocks on a remote identity call. I want it to
fail fast — return an error immediately when the remote call is slow,
instead of letting the request hang.

## Context
- Spring Boot 3 service, class \`LoginService\`, method
  \`login(String user, String pass)\`.
- The remote call is \`identityClient.verify(user, pass)\` — a blocking
  HTTP call already wrapped in a \`CompletableFuture\`.
- The endpoint is \`POST /api/login\`, returns \`401\` on bad creds.

## Constraints
- Do NOT change the public API or the contract of \`login\`.
- Do NOT add new dependencies.
- The failure path must never throw a raw exception — return a typed result.
- Timeout of 1.5s, applied to the remote call only.

## Acceptance criteria
- A new test \`slowRemoteFailsFast\` where the identity client takes 5s:
  the call returns within 2s.
- Existing tests for happy-path login still pass.
- The timeout is configurable via a constructor parameter (default 1500ms).
`,
            },
          ],
        },
        {
          id: 'contract-bullets-for-agent',
          title: 'Write the contract bullets an agent needs',
          concepts: ['prompt-spec'],
          brief: `
A machine can't ask what a class is supposed to do — it will guess. Give it
bullets instead of vibes. Each bullet is one decision you're freezing; each
missing bullet is a decision the model makes alone.

Write the contract bullets an agent would need to implement
\`PasswordValidator\` correctly.
`,
          samples: [
            {
              filename: 'password-contract.md',
              language: 'markdown',
              starter: `# Contract for the agent: PasswordValidator

"Implement PasswordValidator. It checks passwords."

That's the request as it might actually be sent. Rewrite it as bullets:

## Behavior

## Rules

## Edge cases

## Explicitly NOT in scope
`,
              reference: `# Contract for the agent: PasswordValidator

"Implement \`PasswordValidator\`. It validates passwords."

## Behavior
- \`validate(String password)\` returns \`true\` iff the password satisfies
  all rules below.
- \`null\` and empty string are invalid — always \`false\`, never an exception.
- The class is immutable; rules are set at construction time.

## Rules
- Length between 8 and 64 characters inclusive.
- Must contain at least one uppercase, one lowercase, and one digit.
- Must not contain the literal substring "password" (case-insensitive).

## Edge cases
- Leading/trailing whitespace counts as part of the password (no trimming).
- Unicode letters: only A–Z / a–z count as letters; digits are 0–9 only.

## Explicitly NOT in scope
- No strength scoring, no entropy checks, no history/breach lookup.
- No database access of any kind.
- No dependency on a password-encoding library — this is validation, not hashing.

Each bullet above is a test the agent could write. If a bullet is ambiguous
to you, it's ambiguous to the model — fix the bullet.
`,
            },
          ],
        },
        {
          id: 'missing-context',
          title: 'Name the missing context in a request',
          concepts: ['prompt-spec'],
          brief: `
This prompt is confidently underspecified:

> "Refactor the InventoryService so imports are grouped alphabetically."

Name at least three things the model must know before it can do this
*safely*, then write the corrected prompt that supplies them.
`,
          samples: [
            {
              filename: 'missing-context.md',
              language: 'markdown',
              starter: `# Missing context hunt

The request: "Refactor the InventoryService so imports are grouped alphabetically."

## What the model cannot know

1.
2.
3.

## The corrected prompt

## Intent

## Context

## Constraints

## Acceptance criteria
`,
              reference: `# Missing context hunt

The request: "Refactor the InventoryService so imports are grouped alphabetically."

## What the model cannot know

1. **Scope** — does "InventoryService" mean one class, the package, or the
   whole module? A refactor request without scope is a landmine.
2. **Why** — is this a style-policy change (so every class should follow) or
   a one-off? The *reason* decides whether the change is one file or many.
3. **The grouping rule** — static imports vs regular imports; do they merge
   or stay separate? "Alphabetical" has a dozen local conventions.
4. **Risk boundary** — is a pure reordering acceptable, or must the diff be
   provably behavior-identical (compiles, tests pass)?
5. **Tooling** — is there a formatter (e.g. Spotless) whose config already
   defines "correct"? If so, the right move is config, not manual edits.

## The corrected prompt

## Intent
Reformat imports in \`InventoryService.java\` only, so they're grouped
(alphabetical) and safe to merge in CI.

## Context
- Single file: \`inventory-service/src/main/java/inventory/InventoryService.java\`.
- The project uses Spotless; its config is the source of truth for formatting.
- A recent manual edit left imports out of order in this one file.

## Constraints
- Do NOT touch any other file.
- Do NOT change the formatter config unless it's actually wrong.
- Zero behavior change — this is formatting only.

## Acceptance criteria
- \`mvn spotless:check\` passes.
- \`git diff --name-only\` shows exactly one file.
`,
            },
          ],
        },
      ],
    },
    {
      id: 'phase-3',
      index: 3,
      title: 'The Agent Loop in Practice',
      subtitle: 'Decomposition, plan review, definition of done',
      difficulty: 'mid',
      sourceRef: 'general-knowlegde/ai-tools-paradigm/agent-loop.md',
      concepts: ['agent-loop', 'template-method', 'testing'],
      overview: phase3Md,
      runInstructions: phase3Run,
      tasks: [
        {
          id: 'decompose-feature',
          title: 'Decompose a feature into task-shaped work',
          concepts: ['agent-loop'],
          brief: `
> 🧠 **Definition — task-shaped work**
>
> A unit of work is **task-shaped** when it's small enough for one
> plan → act → verify pass, verifiable on its own, and single-intent.
> A feature is not a task — a feature is five tasks.
>
> - ✅ Small enough for one loop pass
> - ✅ Has its own acceptance criteria
> - ❌ "Build the feature" — volume, not correctness

Break the feature below into task-shaped units. For each unit, give the
acceptance criteria the agent will be held to.
`,
          samples: [
            {
              filename: 'decomposition.md',
              language: 'markdown',
              starter: `# Feature: "Add a dark mode toggle to the app"

Monolithic request (do NOT send this to an agent):

> "Add dark mode to the app."

## Task 1
**Change:** 
**Acceptance criteria:** 

## Task 2
**Change:** 
**Acceptance criteria:** 

## Task 3
**Change:** 
**Acceptance criteria:** 

## Task 4
**Change:** 
**Acceptance criteria:** 
`,
              reference: `# Feature: "Add a dark mode toggle to the app"

Each task is one loop pass, one intent, independently verifiable.

## Task 1 — Define the theme model
**Change:** Add \`Theme\` enum (LIGHT / DARK / SYSTEM) and a
\`ThemePreference\` holder in the state layer.
**Acceptance criteria:** \`ThemePreference\` defaults to SYSTEM; unit test
covers the three values and the default.

## Task 2 — Persist the preference
**Change:** Save \`ThemePreference\` to localStorage on change, load on start.
**Acceptance criteria:** reload restores the saved value; a test with a fake
storage verifies save and load.

## Task 3 — Wire the UI toggle
**Change:** Add a toggle control to settings that reads and writes the
preference.
**Acceptance criteria:** clicking the toggle updates the persisted value;
component test verifies the round-trip.

## Task 4 — Apply the theme
**Change:** React to preference changes by applying the \`dark\` CSS class to
the root element (and respecting SYSTEM via media query).
**Acceptance criteria:** with the preference LIGHT the class is absent; with
DARK it's present; with SYSTEM it follows the OS setting (test with a mocked
matchMedia).

If a task's acceptance criteria can't be checked without the next task, the
decomposition is wrong — split or merge until each stands alone.
`,
            },
          ],
        },
        {
          id: 'critique-agent-plan',
          title: "Critique an agent's plan",
          concepts: ['agent-loop', 'testing'],
          brief: `
The cheapest checkpoint in the loop is the **plan review** — reject a bad
plan before any code exists. Here is a plan an agent produced for the task
*"Add a \`GET /api/health\` endpoint returning status 200 with JSON
\`{"status":"ok"}\`."*

Read it like you're on the hook for the result. Find the problems, say why
each matters, then write the one-line redirection.
`,
          samples: [
            {
              filename: 'plan-review.md',
              language: 'markdown',
              starter: `# The agent's plan

> 1. Create a new module \`health-service\` with its own pom.xml.
> 2. Add Spring Actuator dependency for the health endpoint.
> 3. Implement \`HealthController\` returning \`ResponseEntity<Map>\`.
> 4. Add a configuration file for the new module.
> 5. Update the README.

## Problems

1.
2.
3.

## Redirection (one or two sentences)

`,
              reference: `# The agent's plan

> 1. Create a new module \`health-service\` with its own pom.xml.
> 2. Add Spring Actuator dependency for the health endpoint.
> 3. Implement \`HealthController\` returning \`ResponseEntity<Map>\`.
> 4. Add a configuration file for the new module.
> 5. Update the README.

## Problems

1. **Module sprawl for a 10-line feature.** The task asks for one endpoint
   in the existing service. Inventing a new module adds a build file, a
   packaging unit, and a deployment unit nobody asked for. This is the
   "invented structure" failure mode.
2. **Wrong dependency.** Actuator exposes an entire health/metrics surface —
   and its own \`/health\` format. The task asks for a *specific* JSON shape.
   Adding Actuator risks the endpoint colliding with or confusing the real
   health checks.
3. **No verification step.** The plan never mentions a test or a curl check
   against the exact contract (\`{"status":"ok"}\`). A plan without
   a DoD is a plan that will declare victory regardless.
4. **README.** Touching docs for an internal endpoint is scope creep the task
   didn't ask for — reject it with the rest.

## Redirection (one or two sentences)

"Implement the endpoint in the existing service, no new module and no
Actuator: add \`HealthController\` with \`GET /api/health\` returning 200 and
\`{"status":"ok"}\`, plus a \`@WebMvcTest\` asserting the exact body.
Do not touch any other file."
`,
            },
          ],
        },
        {
          id: 'definition-of-done',
          title: 'Write a definition of done for an AI-produced change',
          concepts: ['testing'],
          brief: `
> 🧠 **Definition — definition of done (DoD)**
>
> A **DoD** is the written answer to *"how will I know this is finished and
> correct?"* — not the task title. It names the tests, the exact commands,
> the diff-scope rule, and the contract that must survive.

Write a DoD for this task: *"Replace the polling loop in PollerService with a
scheduled executor."* Make every item checkable by a human (or by \`git\` and
\`mvn\`) — no vibes.
`,
          samples: [
            {
              filename: 'definition-of-done.md',
              language: 'markdown',
              starter: `# Definition of Done — scheduled poller

## Behavior (tests)

## Commands to run (exact)

## Diff scope

## Contract that must survive

## Out of scope (what "done" does NOT include)
`,
              reference: `# Definition of Done — scheduled poller

## Behavior (tests)
- New test: \`PollerSchedulesAtFixedRate\` — with a fake scheduler clock,
  verify the poll method is invoked at the configured interval.
- New test: \`PollFailureDoesNotStopScheduler\` — a throwing poll still
  schedules the next run.
- All existing poller tests pass unchanged.

## Commands to run (exact)
- \`mvn -pl poller-service test\` — green.
- \`mvn -pl poller-service verify\` — green (includes checkstyle).

## Diff scope
- \`git diff --name-only\` shows only files under \`poller-service/src/main\`
  and \`poller-service/src/test\`. No config, no docs, no other modules.

## Contract that must survive
- The public \`PollerService\` API is unchanged (same method signatures,
  same constructor).
- Shutdown still stops the scheduler gracefully (\`@PreDestroy\`).

## Out of scope (what "done" does NOT include)
- Not adding new configuration knobs — the existing interval config is kept.
- Not rewriting the poll logic itself — only the scheduling mechanism changes.

If any item here can't be verified by the person receiving the change, it
doesn't belong in the DoD.
`,
            },
          ],
        },
      ],
    },
    {
      id: 'phase-4',
      index: 4,
      title: 'Reviewing AI Output',
      subtitle: 'Plausible-but-wrong, hallucinations, verification tests',
      difficulty: 'advanced',
      sourceRef: 'general-knowlegde/ai-tools-paradigm/reviewing-ai-output.md',
      concepts: ['race-conditions', 'testing'],
      overview: phase4Md,
      runInstructions: phase4Run,
      tasks: [
        {
          id: 'fix-race-counter',
          title: 'Fix the race in AI-generated CacheCounter',
          concepts: ['race-conditions'],
          brief: `
> 🧠 **Concept — plausible-but-wrong**
>
> Code that reads fluently and is subtly incorrect: a race, a leak, a
> swallowed error. The mistakes are **confidence-shaped** — you can't
> glance-review them. You must review against the contract.
>
> The code below is "AI-generated" and *looks* thread-safe. It isn't.
> The contract: \`increment\` is atomic; \`total\` equals the number of
> increments. Compile, run, then fix the race. See
> [Race Conditions](concepts/race-conditions) for the failure mode.
`,
          samples: [
            {
              filename: 'CacheCounter.java',
              language: 'java',
              starter: `package review;

import java.util.HashMap;
import java.util.Map;

/**
 * "AI-generated, thread-safe" counter.
 * Contract: increment(key) is atomic; total(key) == number of increments.
 */
public class CacheCounter {

    private final Map<String, Integer> counts = new HashMap<>();

    // TODO: this get-then-put is NOT atomic. Two threads can both read 0
    // and both write 1 — losing an increment. Fix it.
    public void increment(String key) {
        int current = counts.getOrDefault(key, 0);
        counts.put(key, current + 1);
    }

    public int total(String key) {
        return counts.getOrDefault(key, 0);
    }

    public static void main(String[] args) throws InterruptedException {
        CacheCounter counter = new CacheCounter();
        Thread[] threads = new Thread[8];
        for (int t = 0; t < threads.length; t++) {
            threads[t] = new Thread(() -> {
                for (int i = 0; i < 10_000; i++) counter.increment("hits");
            });
            threads[t].start();
        }
        for (Thread t : threads) t.join();
        System.out.println("expected 80000, got " + counter.total("hits"));
    }
}
`,
              reference: `package review;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Fixed version.
 *
 * The bug: get() + put() is a read-modify-write race. Two threads can read
 * the same value and both write value+1, losing an increment. It's a classic
 * lost-update — the map was ConcurrentHashMap-shaped but the operation was
 * still composite, so the map's atomicity didn't help.
 *
 * Fix: make the read-modify-write one atomic operation with
 * ConcurrentHashMap.compute() — the lock is held across the whole update.
 */
public class CacheCounter {

    private final Map<String, Integer> counts = new ConcurrentHashMap<>();

    public void increment(String key) {
        counts.compute(key, (k, v) -> (v == null ? 0 : v) + 1);
    }

    public int total(String key) {
        return counts.getOrDefault(key, 0);
    }

    public static void main(String[] args) throws InterruptedException {
        CacheCounter counter = new CacheCounter();
        Thread[] threads = new Thread[8];
        for (int t = 0; t < threads.length; t++) {
            threads[t] = new Thread(() -> {
                for (int i = 0; i < 10_000; i++) counter.increment("hits");
            });
            threads[t].start();
        }
        for (Thread t : threads) t.join();
        System.out.println("expected 80000, got " + counter.total("hits"));
    }
}
`,
            },
          ],
        },
        {
          id: 'hallucinated-api',
          title: 'Spot the hallucinated API',
          concepts: ['testing'],
          brief: `
> 🧠 **Definition — hallucination**
>
> Output that asserts something untrue as if it were fact — a library that
> doesn't exist, a method with the wrong signature. It's the model generating
> the most plausible completion, and "plausible" is exactly what a wrong API
> looks like.
>
> The compiler is your fastest reviewer: an API that doesn't exist fails to
> compile. Find the symbol that is not part of the JDK, fix the pipeline,
> and run it. The contract: return unique initials, uppercased, sorted.
`,
          samples: [
            {
              filename: 'NameExtractor.java',
              language: 'java',
              starter: `package review;

import java.util.List;

/** Contract: unique initials of each name, uppercased, sorted, no nulls. */
public class NameExtractor {

    // "AI-generated" — one symbol here is not part of the JDK.
    public static List<String> uniqueInitials(List<String> names) {
        return names.stream()
            .map(n -> n.substring(0, 1).toUpperCase())
            .distinct()
            .sorted()
            .collect(java.util.stream.Collectors.toImmutableSet())
            .stream()
            .toList();
    }

    public static void main(String[] args) {
        System.out.println(uniqueInitials(List.of("alice", "bob", "Alice", "cara")));
    }
}
`,
              reference: `package review;

import java.util.List;

/** Contract: unique initials of each name, uppercased, sorted, no nulls. */
public class NameExtractor {

    public static List<String> uniqueInitials(List<String> names) {
        // Fix: Collectors.toImmutableSet() does not exist in the JDK —
        // that's a Guava method, and "fixing the import" was never the
        // right move because the whole pipeline didn't need a set at all.
        // distinct() already does dedup; sorted() orders; toList() collects.
        return names.stream()
            .map(n -> n.substring(0, 1).toUpperCase())
            .distinct()
            .sorted()
            .toList();
    }

    public static void main(String[] args) {
        System.out.println(uniqueInitials(List.of("alice", "bob", "Alice", "cara")));
        // [A, B, C]
    }
}
`,
            },
          ],
        },
        {
          id: 'verification-tests',
          title: 'Write the verification tests the AI output was missing',
          concepts: ['testing'],
          brief: `
The agent said "done, tests pass." There are no tests. The contract is
stated in the file. Write the test class that the contract requires —
empty input, present/absent, first/last, duplicates.

This is the single most reusable skill in this track: AI output without
verification is a draft. See [Testing — Contracts, Not Code](concepts/testing).
`,
          samples: [
            {
              filename: 'SearchIndex.java',
              language: 'java',
              starter: `package review;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Contract (stated by the engineer):
 *  - contains(target) is true iff target is in the list.
 *  - Handles: empty list, duplicates, first and last elements.
 * AI claimed "done, with tests passing." There are no tests.
 * TODO: write SearchIndexTest covering the contract.
 */
public class SearchIndex {
    private final List<String> items;

    public SearchIndex(List<String> items) {
        this.items = new ArrayList<>(items);
        Collections.sort(this.items);
    }

    public boolean contains(String target) {
        return Collections.binarySearch(items, target) >= 0;
    }
}
`,
              reference: `package review;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SearchIndexTest {

    @Test
    void emptyListContainsNothing() {
        assertFalse(new SearchIndex(List.of()).contains("x"));
    }

    @Test
    void findsPresentElementRegardlessOfInputOrder() {
        assertTrue(new SearchIndex(List.of("b", "a", "c")).contains("b"));
    }

    @Test
    void absentElementIsFalse() {
        assertFalse(new SearchIndex(List.of("a", "b")).contains("z"));
    }

    @Test
    void findsFirstAndLastElements() {
        SearchIndex idx = new SearchIndex(List.of("a", "b", "c"));
        assertTrue(idx.contains("a"));
        assertTrue(idx.contains("c"));
    }

    @Test
    void duplicatesStillFound() {
        assertTrue(new SearchIndex(List.of("x", "x")).contains("x"));
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
      index: 5,
      title: 'Delegation Boundaries',
      subtitle: 'Trust boundaries, context budget, your own policy',
      difficulty: 'advanced',
      sourceRef: 'general-knowlegde/ai-tools-paradigm/delegation-boundaries.md',
      concepts: ['trust-boundary'],
      overview: phase5Md,
      runInstructions: phase5Run,
      tasks: [
        {
          id: 'delegation-policy',
          title: 'Build your personal delegation policy',
          concepts: ['trust-boundary'],
          brief: `
> 🧠 **Definition — trust boundary**
>
> The line between work the machine produced and work you have personally
> verified. Four decisions never cross it: **architecture, security,
> requirements, acceptance.** See [The Trust Boundary](concepts/trust-boundary).

Write your policy: a matrix of work types → delegate or keep, plus the
one sentence you'll say out loud when you catch yourself breaking it.
`,
          samples: [
            {
              filename: 'delegation-policy.md',
              language: 'markdown',
              starter: `# My delegation policy

| Work type | Delegate? | Why / rule |
|---|---|---|
| Implement to a written contract | | |
| Boilerplate / glue / migrations | | |
| Refactor with pinned tests | | |
| Exploratory prototype | | |
| Architecture decisions | | |
| Security design | | |
| Requirements | | |
| Final acceptance | | |

## The rule I'll break most, and how I'll catch it

## The one sentence
`,
              reference: `# My delegation policy

| Work type | Delegate? | Why / rule |
|---|---|---|
| Implement to a written contract | ✅ | The decision is made; the typing is mechanical |
| Boilerplate / glue / migrations | ✅ | Low risk, high volume |
| Refactor with pinned tests | ✅ | Tests already define the contract |
| Exploratory prototype | ✅ | Cheap ideas, throwaway |
| Architecture decisions | ❌ | The model can't see the system around the code |
| Security design | ❌ | One plausible wrong = one breach |
| Requirements | ❌ | Top of the decision stack |
| Final acceptance | ❌ | Accountability is not delegable |

## The rule I'll break most, and how I'll catch it
Architecture. I'll drift into "let the agent pick the pattern" because it's
faster — the catch is my 30-second plan review, where I ask "did *I* decide
the shape of this, or did it?"

## The one sentence
I delegate typing, never decisions — and every agent output is cargo until I
verify it against the contract I wrote.
`,
            },
          ],
        },
        {
          id: 'pipeline-diagram',
          title: 'Design an agent pipeline for a release',
          concepts: ['trust-boundary'],
          brief: `
Design a release pipeline that uses AI where it's strong and gates it where
it isn't. Draw a mermaid flowchart (it renders in the overview pane) with
**handoffs and gates**: every handoff names its contract, every gate names
its DoD.

Mermaid cheat sheet:

\`\`\`mermaid
flowchart LR
    A["Step A"] --> B["Gate: check X"]
\`\`\`
`,
          samples: [
            {
              filename: 'release-pipeline.md',
              language: 'markdown',
              starter: `# AI-assisted release pipeline

\`\`\`mermaid
flowchart LR
    A[""] --> B[""]
\`\`\`

## Handoffs (each names its contract)

## Gates (each names its DoD)

## Where AI is NOT allowed in this pipeline, and why
`,
              reference: `# AI-assisted release pipeline

\`\`\`mermaid
flowchart LR
    H["Human: requirements + architecture<br/>(never delegated)"]
    H --> SP["AI: write per-task specs<br/>with DoD"]
    SP --> G1{"Gate 1<br/>spec review"}
    G1 -->|reject| SP
    G1 -->|approve| C["AI: implement tasks<br/>tests-first per spec"]
    C --> G2{"Gate 2<br/>run tests + review diff"}
    G2 -->|reject| C
    G2 -->|approve| D["Human: acceptance<br/>run DoD, sign off"]
\`\`\`

## Handoffs (each names its contract)
- Requirements → specs: the spec *is* the contract — intent, context,
  constraints, DoD per task.
- Specs → implementation: each task passes only with its tests green.
- Implementation → acceptance: a diff + test report the human can read.

## Gates (each names its DoD)
- Gate 1 (spec review): every task has a checkable DoD; nothing assumed;
  scope matches the architecture. Rejected in seconds, not minutes.
- Gate 2 (implementation): the exact test commands pass *when I run them*,
  and the diff touches only the files each task claimed.

## Where AI is NOT allowed in this pipeline, and why
Requirements and architecture (human-only decisions), and final acceptance —
the machine would always sign itself off. Gate 2's tests are non-negotiable:
the DoD is verified by me, never by the agent's self-report.
`,
            },
          ],
        },
        {
          id: 'per-file-decision',
          title: 'Decide per file: delegate or human',
          concepts: ['trust-boundary'],
          brief: `
A sprint ends with these files changed. For each, decide: delegate the work
to an agent, keep it human, or a mix — and justify from the **four
human-only decisions** (architecture, security, requirements, acceptance),
not from "it's simple."

Reason from your policy — this is the per-file drill from the run
instructions.
`,
          samples: [
            {
              filename: 'per-file.md',
              language: 'markdown',
              starter: `# Per-file decision

| File | Delegate / Human / Mix | Why (which human-only decision applies) |
|---|---|---|
| \`OrderService.java\` (business rules) | | |
| \`OrderRepository.java\` (SQL mapping) | | |
| \`AuthFilter.java\` (token validation) | | |
| \`order-dto.json\` (API contract) | | |
| \`pom.xml\` (new dependency) | | |
| \`OrderServiceTest.java\` | | |

## The pattern I notice in my answers
`,
              reference: `# Per-file decision

| File | Delegate / Human / Mix | Why (which human-only decision applies) |
|---|---|---|
| \`OrderService.java\` (business rules) | Mix | Requirements are human; transcription of *stated* rules is delegable. I write the rules, the agent drafts the if-statements, I review. |
| \`OrderRepository.java\` (SQL mapping) | Delegate | Mechanical mapping of a defined table. Verifiable: run the queries. |
| \`AuthFilter.java\` (token validation) | Human | Security. One plausible-but-wrong validation branch is a breach. |
| \`order-dto.json\` (API contract) | Human | The API shape is a contract with external consumers — requirements + architecture. |
| \`pom.xml\` (new dependency) | Mix | The *choice* of dependency is architecture/security (supply chain) — human. The edit itself is trivial. |
| \`OrderServiceTest.java\` | Delegate | I write the contract bullets; the test is transcription of them. |

## The pattern I notice in my answers
Every "Human" answer traces to one of the four decisions — most often
security or requirements. Nothing I marked "delegate" involved a decision I
hadn't already made. That's the pattern: delegable = decided, human = still
undecided.
`,
            },
          ],
        },
      ],
    },
  ],
};
