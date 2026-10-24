## Phase 3 — Build & Integrate a Small Reusable Component

Now you wire the existing diagrams into the chord-edit dialog. The whole change
is: a small view component + a dependency + two lines of wiring.

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
    class P1,P2 done
    class P3 active
```

---

### Step 1 — a small view component

Create a `JPanel` that *contains* several `GuitarDiagramComponent`s. This is
**composition + view/model separation**: the panel takes a model
(`ExtChordSymbol`) and renders it.

```java
public class GuitarChordDiagramPanel extends JPanel {
    private static final int MAX_DIAGRAMS = 6;
    private final TGChordCreatorUtil chordCreator = new TGChordCreatorUtil(4);

    public GuitarChordDiagramPanel() {
        super(new FlowLayout(FlowLayout.LEFT, 8, 8));
        setOpaque(false);
    }

    public void showChord(ExtChordSymbol ecs) {
        removeAll();
        if (ecs != null) {
            chordCreator.getChords(ecs).stream()
                .limit(MAX_DIAGRAMS)
                .forEach(tgChord -> add(new GuitarDiagramComponent(tgChord, ecs)));
        }
        revalidate();
        repaint();
    }
}
```

### Step 2 — add the module dependency

`CL_EditorImpl/pom.xml` must declare it can use `InstrumentComponents`. This is
the acyclic check from Phase 1.

```xml
<dependency>
  <groupId>org.jjazzlab.app</groupId>
  <artifactId>instrumentcomponents</artifactId>
  <version>${project.version}</version>
</dependency>
```

### Step 3 — wire it in, without touching generated code

The dialog is a NetBeans **Form Editor** window with an auto-generated
`GroupLayout`. Editing generated layout code by hand gets clobbered. But it's a
`JTabbedPane` — so you add a **tab programmatically**. That's why the component
chose a tab: you can extend a form at runtime without fighting the layout.

```java
initComponents();
tabbedPane.addTab("Guitar", pnl_Guitar);   // runtime extension, no form edits

// when a chord changes:
pnl_Guitar.showChord(ecs);
```

### The patterns in play
- **Composition** — the panel *has-a* list of diagram components (not is-a).
- **View/model separation** — the panel only renders; `TGChordCreatorUtil` does the logic.
- **Builder-style config** — constructing the `GuitarDiagramComponent` with args + setting colors.
- **Template method** — Swing's `paintComponent` (overridden in `GuitarDiagramComponent`) defines the *paint* skeleton that the base class calls.

### The one-sentence takeaway
**Reuse the existing component, keep your new code a thin view, and integrate
into an auto-generated form via a runtime tab — not by editing generated code.**

---

## Bonus: the guide-tone solo generator (Strategy pattern)

A different kind of feature: instead of a UI, generate **music**. The idea is a
guide-tone solo line — land on the **3rd & 7th** of each chord.

### The Strategy pattern
JJazzLab defines a **`PhraseBuilder`** interface (a Strategy):
```java
public interface PhraseBuilder {
    Phrase build(List<SimpleChordSequence> scsList, int tempo);
}
```
- **Strategy** = "plug in a different algorithm without changing the caller."
- The walking-bass and two-feel builders are different `PhraseBuilder` strategies.
- A solo generator is just another one.

### A minimal, musical prototype
```java
public class GuideToneSoloBuilder implements PhraseBuilder {
    public Phrase build(List<SimpleChordSequence> scsList, int tempo) {
        Phrase phrase = new Phrase(1);
        int prevPitch = -1;
        for (SimpleChordSequence scs : scsList)
            for (CLI_ChordSymbol cliCs : scs) {
                ExtChordSymbol ecs = cliCs.getData();
                float pos = scs.getStartBeatPosition() + cliCs.getPosition().getBeat();
                int guide = pickGuideTone(ecs, prevPitch);          // 3rd or 7th, closest to prev = voice leading
                if (pos >= 0.5f)
                    phrase.add(new NoteEvent(guide - 1, 0.5f, 80, pos - 0.5f)); // chromatic approach
                phrase.add(new NoteEvent(guide, 1.5f, 95, pos));               // land on guide tone
                prevPitch = guide;
            }
        return phrase;
    }
}
```
It picks a **guide tone** per chord, uses a **chromatic approach** into it, and
**voice-leads** by choosing the guide tone closest to the previous note.

### The NetBeans Lookup gotcha (hit in testing)
Trying to run this standalone failed with *"No CLI_Factory implementation found."*
Cause: `CLI_Factory.getDefault()` discovers implementations via **NetBeans Lookup**,
which only works inside the app's module system — a bare classpath finds nothing.
**Lesson:** SPI/plugin services (like `CLI_Factory`) can't be tested standalone;
you test them inside the app (or register the impl explicitly).

### What's next for this idea
- Wire it as a **rhythm voice** so the guide-tone line actually plays.
- Add passing tones / call-and-response phrasing.


---

## Extra: a live-following "Chord Shapes" window (the pattern to know)

The chord-edit dialog is a *static* helper — you open it on a specific chord. But
a learner playing along wants to **see the chord change live as the song plays.**
That needs two more concepts.

### 1. A NetBeans `TopComponent` (a dockable window)

A `TopComponent` is NetBeans' way to add a window. You annotate it and the
platform handles docking/persistence/menu registration:

```java
@TopComponent.Description(preferredID = "ChordShapesTopComponent")
@TopComponent.Registration(mode = "jlnavigator", openAtStartup = false, position = 25)
@ActionReference(path = "Menu/Window", position = 25)
public final class ChordShapesTopComponent extends TopComponent { ... }
```

- The **annotations** do the wiring (window mode, menu item, persistence).
- `componentOpened()` / `componentClosed()` are where you start/stop *listening*.

### 2. The Observer pattern via `PlaybackListener`

To follow the song, subscribe to the `MusicController`. JJazzLab fires
`PlaybackListener.chordSymbolChanged(CLI_ChordSymbol)` on the EDT whenever the
playhead hits a new chord:

```java
PlaybackListener l = new PlaybackListenerAdapter() {
    @Override public void chordSymbolChanged(CLI_ChordSymbol cs) {
        guitarPanel.showChord(cs == null ? null : cs.getData());
    }
};
MusicController.getInstance().addPlaybackListener(l);   // start
// ... later:
MusicController.getInstance().removePlaybackListener(l); // stop
```

- **Observer pattern:** the HUD *registers interest* and gets notified — it never
  polls. That's why it updates live with zero CPU overhead.
- **EDT rule:** the callback is on the Swing EDT, so it's safe to touch Swing
  components directly (no manual `SwingUtilities.invokeLater`).

That combination — a **TopComponent** + a **PlaybackListener** — is the clean,
idiomatic way to build any "follow the music" feature in JJazzLab (metronome
lights, current-chord HUD, etc.).

---

## Debugging lesson: "the diagram doesn't show" ≠ "no data"

When a learner says "it only shows `[ F A C E ]`, not the shape," check **what
view** they're in before assuming a bug:

- `ecs.toNoteString()` → a **list of note names** (`[ F A C E ]`). That's the
  chord's *notes* label, not the diagram.
- `GuitarDiagramComponent` → the **actual fretboard** (grid + dots). Different view.

To confirm the data path (not the paint), write a tiny throwaway that calls the
generator directly:
```java
var list = new TGChordCreatorUtil(4).getChords(new ChordSymbol("Fmaj7"));
System.out.println("voicings=" + list.size());   // 30 for Fmaj7
```
If the generator returns voicings (it does), the problem is **where/how the view
is shown**, not the chord logic. Good debugging rule: **isolate data from paint**
— verify the data path with a print, then look at the UI wiring.


