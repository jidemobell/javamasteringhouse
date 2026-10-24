## The problem: one giant jar, no boundaries

Compile everything into a single artifact. Add libraries ad hoc. Nobody knows
what's actually used, and the build is a black box.

## The fix: a Maven multi-module reactor

Maven orchestrates a **parent POM** that lists child modules. Each module has
its own `pom.xml` declaring its dependencies; the parent defines shared config.

```xml
<!-- parent pom.xml -->
<packaging>pom</packaging>
<modules>
  <module>model/Harmony</module>
  <module>app/CL_EditorImpl</module>
  <module>app/InstrumentComponents</module>
</modules>
```

### The mental model (if you know npm)
- **Maven** ≈ **npm** — the build/dependency tool.
- **`pom.xml`** ≈ **`package.json`** — declares deps + build config.
- `groupId:artifactId:version` ≈ `name:version`.
- **Maven Central** ≈ **npm registry**.
- **`mvn install`** puts each artifact in your local repo (`~/.m2`) so other
  modules can depend on it — a local package cache.

### The key difference from npm
- Maven is **declarative**: it has a fixed **lifecycle**
  (`compile → test → package → install`). You don't script it; you pick phases.
- npm is **script-driven**: `package.json` scripts tell it what to do.
- Maven's `install` phase is what makes a multi-module build work — it installs
  each module so its siblings can use it.

### The JJazzLab angle
JJazzLab is a NetBeans Platform app, so it uses the `nbm-maven-plugin` to build
NetBeans modules (`<packaging>nbm</packaging>`) and assemble the app
(`<packaging>nbm-application</packaging>`). The root `pom.xml` has a
`compiler.release` property (e.g. `25`) — that's the Java version the compiler
*targets*. You need a JDK **>=** that release to build it.

### The fast inner loop (learn this from a real multi-module app)

When you change one module, you don't want to rebuild the whole reactor every
time. Two commands matter:

```bash
# 1. FAST check — compile just this module (+ its dependencies)
mvn -pl app/CL_EditorImpl -am compile -DskipTests

# 2. To actually run the app — install, so the app module reassembles
mvn install -DskipTests
```

- **`-pl <module>`** = "only this module." **`-am`** = "also-make" its dependencies.
- **`compile`** just compiles → good for a quick syntax/type check.
- **`install`** puts the artifact in your local repo (**`~/.m2`**) — this is what
  makes the **app module** (the `nbm-application`) reassemble with your change.
  If you only `compile`, the running app still uses the old jar. **You must
  `install` and relaunch** for a Java desktop app to pick up the edit.
- The build log prints modules in **dependency order** — you can watch the DAG
  from Phase 1 resolve bottom-up.

### The git-ignored binary gotcha
Open-source projects often **git-ignore large binary resources** (soundfonts,
models, native libs) because they bloat a repo. That means `mvn install` can
succeed *and still produce an app that's missing a runtime piece*.

JJazzLab's FluidSynth soundfont is exactly this: the build copies
`src/main/soundfont/JJazzLab-SoundFont.sf2` → `modules/soundfont/`, but the file
isn't in git. The build "passes" while the app can't produce sound. The repo's
`README` tells you to place the file manually.

**Lesson:** a successful compile/install ≠ a working app. Large assets that a
build needs are often **manually supplied** — check resource dirs and READMEs
for "place file here" notes. And sometimes you can override at runtime with a
system property (JJazzLab: `-J-DFluidSynthSoundFontFile=/path/to.sf2`).

### When *not* to use multi-module
- A single small library or app. The reactor adds overhead; a single module is
  simpler.
