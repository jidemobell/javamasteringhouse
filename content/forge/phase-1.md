## Phase 1 — The Paradigm Shift

Software development has crossed a threshold. You can now spend more of your
day *deciding what to build* and less time *transcribing it into a language a
machine accepts*. That sounds like a small change. It is not — it changes which
skills matter, what "done" means, and who is accountable.

This phase gives you the vocabulary. The rest of the track trains the habits.

### Where this fits in the bigger picture

```mermaid
flowchart LR
    P["Phase 1<br/>The Paradigm Shift"]
    S["Phase 2<br/>Prompts Are Contracts"]
    L["Phase 3<br/>The Agent Loop"]
    R["Phase 4<br/>Reviewing AI Output"]
    D["Phase 5<br/>Delegation Boundaries"]
    P --> S --> L --> R --> D
    classDef done fill:#1e293b,stroke:#475569,color:#94a3b8
    classDef active fill:#0f766e,stroke:#22d3ee,color:#e0f2fe,stroke-width:3px
    classDef todo fill:#0b1020,stroke:#334155,color:#475569
    class P active
    class S,L,R,D todo
```

> Brightly lit = **what this phase builds**. Outlined = coming up.

---

### Definition: what an AI coding tool actually is

> 🧠 **Definition — AI coding assistant**
>
> An **AI coding assistant** is a system that accepts natural-language
> instructions plus context from your codebase and returns candidate changes:
> code, explanations, or plans. You remain the author and the accountable
> party. The tool is a **force multiplier for decisions you have already made**
> — it is not a replacement for making them.

That last sentence is the whole track in one line. Everything downstream of it
is about making sure your decisions are real before you ask for the output.

### Definition: the agent loop

> 🧠 **Definition — the agent loop**
>
> An **agent** is an assistant that doesn't just answer — it *acts*. It plans,
> edits files, runs commands, reads results, and iterates until it believes
> it's done. The shape is always the same:
>
> ```mermaid
> flowchart LR
>     A["1. Plan"] --> B["2. Act"]
>     B --> C["3. Verify"]
>     C -->|fails| A
>     C -->|passes| D["4. Deliver"]
> ```
>
> - ✅ The loop is the paradigm. Plan → act → verify → repeat.
> - ✅ Verification is the step humans mostly skip — and the one that matters.
> - ❌ Treating the loop as Plan → Act → *trust me*. That's not delegation,
>   that's delegation of your judgment.

The agent loop is [Template Method](concepts/template-method) wearing a costume:
*you* fix the skeleton (the loop), the *agent* fills the variable steps (the
edits). The skeleton never changes; the steps change every time. On this
platform you already know how to value that pattern — now you get to be the
base class.

### The other terms you'll meet

| Term | Meaning in one sentence |
|---|---|
| **Context** | Everything the tool can see about your problem: files, instructions, conversation. Garbage in, garbage out — but also *narrow* in, narrow out. |
| **Context window** | The finite amount of text the model can hold at once. You cannot paste the whole repo. |
| **Tools** | The capabilities the agent can invoke: read files, search, edit, run commands, fetch URLs. No tools → it can only talk. |
| **Trust boundary** | The line between what the AI produced and what you have personally verified. Everything below the line is cargo. |
| **Supervised delegation** | You direct, the machine drafts, you verify, you own. The stance this whole track teaches. |
| **Vibes coding** | Delegation without supervision — accept, ship, pray. The anti-pattern this track exists to kill. |

---

### The two shifts

**Shift 1 — from writing to specifying.** The bottleneck used to be typing
speed. Now it's the precision of your intent. A vague instruction returns a
confident-looking implementation of *some* intent — usually a different one
than yours. Precision is the skill.

**Shift 2 — from "does it run?" to "is it right?"** The machine produces
plausible output by construction. That is the new default, and it is worthless
until verified. Your tests, your review, your judgment — that's the part the
machine cannot do for you, because that's the part that defines *right*.

The platform you're standing on already believed this: contracts first, tests
freeze decisions, code is downstream. The AI tools paradigm does not replace
that discipline. It makes the discipline *the only thing left that you do*.

---

### Before you start the tasks

Get one AI coding tool available before Phase 2. Any of these work:

- A coding agent in your editor (Claude Code, Copilot, Cursor, Kilo, …)
- A chat-based assistant with file access
- The agent you're talking to right now

You'll be writing prompts, specs, and reviews — not Java. If you only have a
plain chat LLM, that's fine; the exercises are tool-agnostic. The run
instructions for this phase explain the setup in detail.

### Tasks in this phase

1. Define the agent loop in your own words
2. Write the paradigm shift: imperative vs delegation
3. Audit your own workflow for AI opportunities
