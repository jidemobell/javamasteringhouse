## The problem: a 60-file "everything" project

One module that does UI, model, build, and data. Any change risks breaking
something you can't see. Nobody knows what depends on what.

## The fix: split into modules with one-way dependencies

A multi-module Maven project (like JJazzLab) is a **directed acyclic graph
(DAG)** of modules. Each module declares exactly what it depends on; nothing
loops back.

```
CL_EditorImpl ──▶ InstrumentComponents ──▶ Harmony (core)
     │                                        ▲
     └──────────────▶ CL_Editor ───────────────┘
```

### How modules stay acyclic
1. **Dependencies point one way.** A low-level module (`Harmony`) never imports
   a high-level UI module. If it did, you'd have a cycle and the build breaks.
2. **Encapsulation via public packages.** A NetBeans module exposes only the
   packages you declare as `publicPackage` in its `pom.xml`; everything else
   stays private. This is module-level encapsulation.
3. **Lower modules don't know about higher ones.** `InstrumentComponents`
   depends on core + settings, not on the editor that will use it.

### Rules of thumb
- If A imports B, B must never import A.
- Put shared, stable things low (model, utilities); put UI high.
- Keep each module's *public* surface small — that's your API.

```xml
<publicPackages>
  <publicPackage>org.jjazz.instrumentcomponents.guitardiagram.api</publicPackage>
</publicPackages>
```

### When *not* to split
- A small app (single module) doesn't need this. Splitting is a cost — only
  worth it when you have multiple teams or genuinely separate concerns.
