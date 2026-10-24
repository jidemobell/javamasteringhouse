## Phase 2 — Find a Feature You Can Reuse

You want "show guitar chord shapes." Before building anything, search for
existing code. Good engineers reuse more than they write.

### Where this fits

```mermaid
flowchart LR
    P1["Phase 1<br/>Read the codebase"]
    P2["Phase 2<br/>Find a feature to reuse"]
    P3["Phase 3<br/>Build & integrate"]
    P1 --> P2 --> P3
    classDef done fill:#1e293b,stroke:#475569,color:#94a3b8
    classDef active fill:#0f766e,stroke:#22d3ee,color:#e0f2fe,stroke-width:3px
    classDef todo fill:#0b1020,stroke:#334155,color:#475569
    class P1,P2 active
    class P3 todo
```

---

### The discovery: it already exists

Search the codebase for `GuitarDiagramComponent`, `TGChordCreatorUtil`, and
`ChordViewer`. You'll find a whole **guitar-diagram** subsystem already in the
`InstrumentComponents` module, reused from the TuxGuitar project.

- `GuitarDiagramComponent` — a `JPanel` that paints a fretboard.
- `TGChordCreatorUtil` — a **generator/factory**: `getChords(chordSymbol)`
  returns a list of `TGChord` voicings.
- `GuitarChordViewer` — a `ChordViewer` implementation that puts these on screen.

### The pattern to spot: SPI / plugin

`GuitarChordViewer` is registered as a `ChordViewer` via `@ServiceProvider`.
It's **not** hard-wired into a central list — the container finds it by lookup.

```java
@ServiceProvider(service = ChordViewer.class, position = 100)
public class GuitarChordViewer extends JPanel implements ChordViewer { ... }

// any consumer:
Lookup.getDefault().lookupAll(ChordViewer.class);
```

That's the **plugin pattern**: add a new viewer with zero edits to existing code.

### The generator in action

```java
var voicings = new TGChordCreatorUtil(4).getChords(ecs);  // one chord in, many out
```

It reads `ecs.getBassNote()` and `ecs.getRootNote()`, so slash chords like
`Abm/E` and `Ab/C` are handled automatically. The **view** never does chord
theory — it just paints what the generator returns.

### Why this matters
The feature you want is 90% already built. Your job is not to reinvent the
diagram — it's to **wire the existing, well-encapsulated component into the
place the learner needs it**. That's a far smaller change.
