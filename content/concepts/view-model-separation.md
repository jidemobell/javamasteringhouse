## The problem: a component that knows too much

```java
class ChordPanel extends JPanel {
    // In this panel, we parse chord strings, compute voicings, do layout, and paint.
}
```

UI code that also does chord math, JSON parsing, and business rules is hard to
test and easy to break. It mixes the model (what the data is), the
view (how it looks), and the control (what to do).

## The fix: separate the model from the view

Keep the **model** (pure data/logic, no Swing) apart from the **view** (Swing
component that renders it). The view receives a model object and renders it;
it doesn't know where the model came from.

```java
// Model — no UI imports
class GuitarVoicing { /* notes, strings, frets */ }

// View — receives a model, renders it
class GuitarChordDiagramPanel extends JPanel {
    void showChord(ExtChordSymbol ecs) {
        // ask a generator for voicings, add diagram components
    }
}
```

In JJazzLab this is exactly the split:
- `ChordSymbol` / `ChordType` — **model** (in `Harmony` module, no UI).
- `TGChordCreatorUtil` — **logic** that converts a model → diagram models.
- `GuitarDiagramComponent` — **view** that paints a fretboard.

### Rules of thumb
- A view should take a model and render it — no business logic, no IO.
- The model shouldn't know about Swing or the file system.
- Reusability: a model used by many views, and a view reused for many models.

### When *not* to separate
- A one-off, throwaway screen. But if you'll reuse the model or the view, the
  separation pays for itself quickly.
