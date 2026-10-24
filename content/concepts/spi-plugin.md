## The problem: hard-wiring plugins

```java
// If you want to add a new "chord viewer" later, you edit this list:
List<ChordViewer> viewers = List.of(new GuitarChordViewer(), new PianoChordViewer());
```
Now every new feature means touching a central file. Open code, closed worlds.

## The fix: service provider interface + discovery

An **SPI (Service Provider Interface)** lets a module declare "I implement this
service" and a container *find* all implementations automatically — no central
registry to edit.

```java
@ServiceProvider(service = ChordViewer.class, position = 100)
public class GuitarChordViewer extends JPanel implements ChordViewer {
    // ...
}
```

Then anything that needs viewers just asks the container:

```java
var viewers = Lookup.getDefault().lookupAll(ChordViewer.class);
```

### Why this is the plugin pattern
- **Open/closed:** add a new `ChordViewer` implementation with zero edits to
  existing code. The `@ServiceProvider` annotation is the registration.
- **Decoupled:** the consumer depends only on the *interface* (`ChordViewer`),
  not on concrete classes.
- **Ordered:** `position` lets you control display order.

### Rules of thumb
- Define the SPI interface separate from implementations.
- Consumers depend on the interface via lookup — never `new` a concrete impl.
- Register via annotation or a `META-INF/services` file, not a hard-coded list.

### When *not* to use it
- A single implementation with no chance of more. Then an interface + lookup is
  ceremony — instantiate the object directly.
