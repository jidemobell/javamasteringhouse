# AppHome — Java Mastery Platform

One platform, two tracks, one shared concept library. Mid-to-advanced Java only —
no `int x = 5` lessons.

## The two tracks

| Track | Mode | Source |
|---|---|---|
| **Nexus — Route Topology Simulator** | Phased (1 → 6) | [`general-knowlegde/projects/nexus-route-topology-simulator/`](../../general-knowlegde/projects/nexus-route-topology-simulator) |
| **Mini-ASM — Multi-Service Deep Dive** | Project (pick any module) | [`mini-asm/projectcore/`](../projectcore) |

Both tracks link into the same **Concept Library** (Template Method, Race
Conditions, Deadlocks, ExecutorService, Builder, Generics, Health Checks).

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

## What this replaces

- `mini-asm/masterjava` — earlier shell, kept for reference.
- `mini-asm/newtutorial` — earlier dashboard prototype.
- `general-knowlegde/projects/nexus-route-topology-simulator/` — phase markdown.
  This app rewrites the narratives in a more concise, opinionated voice; the
  originals stay as the long-form source.
