import type { Track } from '../../types';

import phase1Md from '../../../content/guitarlab/phase-1.md?raw';
import phase2Md from '../../../content/guitarlab/phase-2.md?raw';
import phase3Md from '../../../content/guitarlab/phase-3.md?raw';

// Track — GuitarLab: Enhancing an Open-Source Java App (JJazzLab)
// Phased track teaching systems design through a real change: reading a
// modular NetBeans/Maven codebase, reusing an existing component via an SPI,
// then shipping a small feature without editing generated code.

export const guitarlabTrack: Track = {
  id: 'guitarlab',
  name: 'GuitarLab — Enhancing an Open-Source Java App',
  tagline:
    'Read a modular NetBeans codebase, reuse an existing component via an SPI, and ship a small feature without editing generated code.',
  mode: 'phased',
  phases: [
    {
      id: 'phase-1',
      index: 1,
      title: 'Read a Modular Java Codebase',
      subtitle: 'Maven modules, the dependency DAG, and the target release',
      difficulty: 'entry',
      sourceRef: 'code_files/JJazzLab/',
      concepts: ['module-layering', 'maven-multimodule'],
      overview: phase1Md,
      runInstructions: `\`\`\`bash
# Confirm the JDK meets the target release, then build
mvn clean install -DskipTests
\`\`\`

> The project targets \`release=25\` in the root \`pom.xml\`. You need a JDK >= 25.
> Maven reads the \`java\` on your PATH, so make sure your default JDK qualifies.`,
      tasks: [
        {
          id: 'map-the-module-graph',
          title: 'Map the module graph and dependency direction',
          concepts: ['module-layering'],
          brief: `
> 🧠 **Concept — Module layering**
>
> A multi-module Maven project is a **directed acyclic graph (DAG)**. Each module
> declares what it depends on; nothing loops back. A NetBeans module exposes only
> its \`publicPackage\`s — that's module-level encapsulation.

Open the parent \`pom.xml\` and read the \`<modules>\` list. Then pick two modules
and identify their dependency direction. Answer: *why does a low-level module
never import a high-level UI module?*

- ✅ Dependency direction is one-way (acyclic)
- ✅ \`publicPackage\` is the module's exported API
- ❌ "I'll import whatever I need and worry about cycles later"
`,
          samples: [
            {
              filename: 'module-map.md',
              language: 'markdown',
              starter: `# The Module Graph

The parent pom lists these modules (from memory):

- 
- 
- 

Pick two modules and identify the dependency direction:

| Module A | Module B | A depends on B? | B depends on A? |
|---|---|---|---|
| | | | |

One-way (acyclic) means: 

In one sentence, why a low module must not import a high UI module:
`,
              reference: `# The Module Graph

The parent pom lists these modules (from memory):

- model/Harmony
- app/InstrumentComponents
- app/CL_EditorImpl

Pick two modules and identify the dependency direction:

| Module A | Module B | A depends on B? | B depends on A? |
|---|---|---|---|
| InstrumentComponents | model/Harmony | ✅ | ❌ |
| app/CL_EditorImpl | app/InstrumentComponents | ✅ | ❌ |

One-way (acyclic) means: dependencies only flow "down" (high-level UI → low-level
core), never back up.

In one sentence, why a low module must not import a high UI module:
Changes in a low module ripple up to every consumer. If a low module imported a
high UI module, that dependency would form a cycle and the build would fail — and
it would couple the lowest logic to the highest UI, making both unchangeable.
`,
            },
          ],
        },
        {
          id: 'check-target-release',
          title: 'Find the target release and your JDK',
          concepts: ['maven-multimodule'],
          brief: `
In a Maven build you don't script steps — you pick **lifecycle phases**
(\`compile\`, \`test\`, \`package\`, \`install\`). And a property like
\`compiler.release\` sets the Java version the compiler *targets*.

Find that property, then run \`java -version\`. Does your JDK satisfy it?
`,
          samples: [
            {
              filename: 'jdk-check.md',
              language: 'markdown',
              starter: `# Target release vs your JDK

compiler.release in the root pom: 

my java -version: 

Satisfied? 

In one sentence: why does the JDK need to be **at or above** the target release?
`,
              reference: `# Target release vs your JDK

compiler.release in the root pom: 25

my java -version: 26.0.2.1

Satisfied? Yes — 26 >= 25.

In one sentence: why does the JDK need to be **at or above** the target release?
\`--release 25\` tells the compiler "only use APIs from Java 25". A JDK 26 can
compile for release 25, but a JDK 21 cannot — it doesn't know about Java 25 APIs.
`,
            },
          ],
        },
      ],
    },
    {
      id: 'phase-2',
      index: 2,
      title: 'Find a Feature You Can Reuse',
      subtitle: 'SPI/plugin discovery and a generator you can lean on',
      difficulty: 'intermediate',
      sourceRef: 'app/InstrumentComponents/',
      concepts: ['spi-plugin', 'module-layering'],
      overview: phase2Md,
      tasks: [
        {
          id: 'trace-the-spi',
          title: 'Trace how the chord viewer is discovered',
          concepts: ['spi-plugin'],
          brief: `
> 🧠 **Concept — SPI (service provider interface)**
>
> A module declares "I implement this service" with \`@ServiceProvider\`, and the
> container finds all implementations via lookup — no central registry to edit.
> This is the open/closed plugin pattern.

Search for \`GuitarChordViewer\` and \`ChordViewer\`. How is it registered, and how
does a consumer *find* it? Write what you found.
`,
          samples: [
            {
              filename: 'spi-trace.md',
              language: 'markdown',
              starter: `# Tracing the SPI

How GuitarChordViewer is registered:
- 

How a consumer gets all ChordViewers:
- 

The interface it implements:
- 

Why this beats a hard-coded list (List.of(new GuitarChordViewer(), ...)):
- 
`,
              reference: `# Tracing the SPI

How GuitarChordViewer is registered:
- \`@ServiceProvider(service = ChordViewer.class, position = 100)\` on the class.

How a consumer gets all ChordViewers:
- \`Lookup.getDefault().lookupAll(ChordViewer.class)\`

The interface it implements:
- \`ChordViewer\` — with \`getComponent()\`, \`setModel(ExtChordSymbol)\`, \`getIcon()\`.

Why this beats a hard-coded list:
Adding a new viewer needs zero edits to existing code (open/closed). The consumer
depends only on the interface, so it's decoupled from any concrete viewer.
`,
            },
          ],
        },
        {
          id: 'generator-saves-the-day',
          title: 'Recognize the generator/factory',
          concepts: ['spi-plugin'],
          brief: `
\`TGChordCreatorUtil.getChords(chordSymbol)\` is a **generator**: one chord symbol
in, many voicings out. It reads the bass note, so slash chords like \`Abm/E\` and
\`Ab/C\` are handled. The view never does chord theory.

Sketch the call from a chord symbol to a list of \`TGChord\`.
`,
          samples: [
            {
              filename: 'generator.md',
              language: 'java',
              starter: `// Sketch: chord symbol -> voicings -> components
import org.jjazz.chordleadsheet.api.item.ExtChordSymbol;
import org.jjazz.instrumentcomponents.guitardiagram.api.*;

public class Sketch {
    void show(ExtChordSymbol ecs) {
        TGChordCreatorUtil creator = new TGChordCreatorUtil(4);

        // 1. one chord in, many voicings out:
        //    List<TGChord> voicings = ...

        // 2. turn each voicing into a view component:
        //    GuitarDiagramComponent d = ...
    }
}
`,
              reference: `// Sketch: chord symbol -> voicings -> components
import org.jjazz.chordleadsheet.api.item.ExtChordSymbol;
import org.jjazz.instrumentcomponents.guitardiagram.api.*;

public class Sketch {
    void show(ExtChordSymbol ecs) {
        TGChordCreatorUtil creator = new TGChordCreatorUtil(4);

        // 1. one chord in, many voicings out:
        List<TGChord> voicings = creator.getChords(ecs);

        // 2. turn each voicing into a view component:
        voicings.stream().limit(6).forEach(tgChord -> {
            GuitarDiagramComponent d = new GuitarDiagramComponent(tgChord, ecs);
            // add(d);   // to a container
        });
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
      title: 'Build & Integrate a Small Reusable Component',
      subtitle: 'Composition, view/model separation, and runtime tab wiring',
      difficulty: 'intermediate',
      sourceRef: 'app/CL_EditorImpl/',
      concepts: ['view-model-separation', 'builder-pattern', 'template-method'],
      overview: phase3Md,
      runInstructions: `\`\`\`bash
# Build the changed module and its deps, then run the app
mvn -pl app/CL_EditorImpl -am compile -DskipTests
mvn clean install -DskipTests
app/application/target/jjazzlab/bin/jjazzlab
\`\`\`

> Adding a dependency means re-installing the module so the app module can
> reassemble it.`,
      tasks: [
        {
          id: 'write-the-view-panel',
          title: 'Write the reusable diagram panel',
          concepts: ['view-model-separation'],
          brief: `
> 🧠 **Concept — View/model separation**
>
> A view takes a model and renders it; the model has no UI imports. Here the panel
> (view) receives an \`ExtChordSymbol\` (model) and asks a generator to do the work.

Complete the panel: \`showChord\` should clear, ask \`chordCreator.getChords(ecs)\`,
cap the count, and add a \`GuitarDiagramComponent\` per voicing.
`,
          samples: [
            {
              filename: 'GuitarChordDiagramPanel.java',
              language: 'java',
              starter: `import java.awt.Color;
import java.awt.FlowLayout;
import javax.swing.JPanel;
import org.jjazz.chordleadsheet.api.item.ExtChordSymbol;
import org.jjazz.instrumentcomponents.guitardiagram.api.GuitarDiagramComponent;
import org.jjazz.instrumentcomponents.guitardiagram.api.TGChordCreatorUtil;

public class GuitarChordDiagramPanel extends JPanel {

    private static final int MAX_DIAGRAMS = 6;
    private static final Color TONIC_NOTE_COLOR = new Color(231, 83, 35);
    private final TGChordCreatorUtil chordCreator = new TGChordCreatorUtil(4);

    public GuitarChordDiagramPanel() {
        super(new FlowLayout(FlowLayout.LEFT, 8, 8));
        setOpaque(false);
    }

    public void showChord(ExtChordSymbol ecs) {
        // removeAll();

        // if (ecs != null) {
        //   chordCreator.getChords(ecs).stream().limit(MAX_DIAGRAMS).forEach(...);
        // }

        // revalidate(); repaint();
    }
}
`,
              reference: `import java.awt.Color;
import java.awt.FlowLayout;
import javax.swing.JPanel;
import org.jjazz.chordleadsheet.api.item.ExtChordSymbol;
import org.jjazz.instrumentcomponents.guitardiagram.api.GuitarDiagramComponent;
import org.jjazz.instrumentcomponents.guitardiagram.api.TGChord;
import org.jjazz.instrumentcomponents.guitardiagram.api.TGChordCreatorUtil;

public class GuitarChordDiagramPanel extends JPanel {

    private static final int MAX_DIAGRAMS = 6;
    private static final Color TONIC_NOTE_COLOR = new Color(231, 83, 35);
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
                .forEach(tgChord -> {
                    GuitarDiagramComponent diagram = new GuitarDiagramComponent(tgChord, ecs);
                    diagram.setTonicNoteColor(TONIC_NOTE_COLOR);
                    add(diagram);
                });
        }

        revalidate();
        repaint();
    }
}
`,
            },
          ],
        },
        {
          id: 'wire-the-tab',
          title: 'Add it to the dialog without touching generated code',
          concepts: ['view-model-separation'],
          brief: `
The dialog is a NetBeans **Form Editor** window (auto-generated \`initComponents()\`
with \`GroupLayout\`). Hand-editing that gets clobbered by the form editor. But it's
a \`JTabbedPane\`, so you add a **tab at runtime** — no layout edits needed.

Add a "Guitar" tab and refresh the panel when a chord changes.
`,
          samples: [
            {
              filename: 'ChordSymbolEditorDialogImpl.java',
              language: 'java',
              starter: `// In the constructor, after initComponents():
// tabbedPane.addTab("Guitar", pnl_Guitar);

// In updateChordSymbolInfo(ExtChordSymbol ecs):
// pnl_Guitar.showChord(ecs);
`,
              reference: `// In the constructor, after initComponents():
tabbedPane.addTab("Guitar", pnl_Guitar);

// In updateChordSymbolInfo(ExtChordSymbol ecs):
pnl_Guitar.showChord(ecs);
`,
            },
          ],
        },
      ],
    },
  ],
};
