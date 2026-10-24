# AppHome — Engineering Mastery Platform

One platform, many tracks, one shared concept library. Mid-to-advanced engineering
only — no `int x = 5` lessons.

## Tracks

| Track | Mode | Source |
|---|---|---|
| **Nexus — Route Topology Simulator** | Phased (1 → 6) | [`general-knowlegde/projects/nexus-route-topology-simulator/`](../../general-knowlegde/projects/nexus-route-topology-simulator) |
| **Mini-ASM — Multi-Service Deep Dive** (`meridian`) | Project (pick any module) | [`mini-asm/projectcore/`](../projectcore) |
| **Flux — Spring WebFlux + Maven** | Phased | self-contained |
| **Sentinel — Spring Security + Gradle** | Phased | self-contained |
| **Forge — AI Tooling** | Phased | self-contained |
| **GuitarLab — Enhancing an Open-Source Java App** | Phased (1 → 3) | `code_files/JJazzLab/` |
| **Beacon — SRE Reliability Lab** | Phased (1 → 6) | self-contained (Go + Terraform) |

All tracks link into the same **Concept Library** (Template Method, Race
Conditions, Deadlocks, ExecutorService, Builder, Generics, Health Checks, plus the
reliability set: SLI/SLO/SLA, Error Budgets, Burn-Rate Alerts, Terraform State,
`context` & Graceful Shutdown, Backpressure).

### Beacon — the one non-Java track

Beacon builds one small Go service (`relayd`) and takes it end to end: bounded
worker pool and graceful shutdown → Prometheus SLIs → the whole stack in Terraform
(Docker provider, so there is no cloud account and no spend) → an SLO with an error
budget → fault injection, runbook, postmortem and an error-budget policy.

It exists to close three specific gaps: **Go**, **Terraform/IaC**, and **SLO /
error-budget practice**. Everything it needs is local: Go 1.21+, Docker, Terraform.


## Run it

```bash
cd mini-asm/apphome
npm install
npm run dev
```

## Layout

```
content/                  narrative markdown (loaded via Vite ?raw)
├── concepts/*.md         one file per concept
├── nexus/*.md            one file per phase
├── guitarlab/*.md        one file per phase
├── beacon/*.md           one file per phase
└── miniasm/*.md          one file per service module

src/
├── App.tsx               routes
├── components/
│   ├── CodeEditor.tsx    Monaco + draft persistence + reference toggle
│   ├── ConceptChips.tsx  cross-link concepts from any phase/task
│   ├── Markdown.tsx      shared markdown renderer
│   └── Sidebar.tsx
├── tracks/
│   ├── nexus/index.ts    Track A metadata + Java code samples
│   ├── miniasm/index.ts  Track B metadata + Java code samples
│   ├── beacon/index.ts   SRE track: Go, HCL, PromQL samples
│   └── index.ts          tracks registry
├── concepts/index.ts     concept registry (loads bodies from content/)
├── pages/
│   ├── HomePage.tsx      track picker
│   ├── TrackPage.tsx     phase list
│   ├── PhasePage.tsx     brief + tasks + editor
│   └── ConceptPage.tsx   concept detail + back-links
├── store/useStore.ts     Zustand (persisted): solved tasks, drafts, concepts seen
└── types.ts
```

## How tracks and concepts cross-link

- A **Task** declares `concepts: ['template-method']`.
- The Phase header and Task brief render those as clickable chips.
- The Concept page shows `appearsIn` — back-links to every phase that uses it.
- "Seen" concepts dim slightly so unseen ones stand out.

## Adding content

**A new task on Track A:** edit [src/tracks/nexus/index.ts](src/tracks/nexus/index.ts) and append to `phases[i].tasks`:

```ts
{
  id: 'my-task',
  title: '...',
  concepts: ['template-method'],
  brief: `markdown...`,
  samples: [{ filename: 'X.java', language: 'java', starter: '...', reference: '...' }],
}
```

**A new concept:** drop the body in `content/concepts/<id>.md` and register it in [src/concepts/index.ts](src/concepts/index.ts):

```ts
import casLoopsMd from '../../content/concepts/cas-loops.md?raw';

{
  id: 'cas-loops',
  title: 'CAS loops & atomic refs',
  oneLiner: '...',
  category: 'concurrency',
  body: casLoopsMd,
  appearsIn: [{ trackId: 'nexus', phaseId: 'phase-3' }],
}
```

### Sample languages

`CodeSample.language` accepts `java`, `go`, `hcl`, `promql`, `yaml`, `gradle`,
`json`, `shell`, `markdown`, `plaintext`. Monaco has Java, Go, YAML and JSON
built in; **HCL and PromQL are registered by a small Monarch tokenizer** in
[`src/components/CodeEditor.tsx`](src/components/CodeEditor.tsx) so Terraform and
query samples are not flat grey.

Only `samples[0]` is rendered by `PhasePage`, so **one sample per task** — put the
file the learner actually types.

## What this replaces

- `mini-asm/masterjava` — earlier shell, kept for reference.
- `mini-asm/newtutorial` — earlier dashboard prototype.
- `general-knowlegde/projects/nexus-route-topology-simulator/` — phase markdown.
  This app rewrites the narratives in a more concise, opinionated voice; the
  originals stay as the long-form source.
