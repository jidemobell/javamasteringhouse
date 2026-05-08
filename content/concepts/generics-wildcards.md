## PECS in one example

```java
// Producer (we read from it) → ? extends T
void copyAll(List<? extends Resource> src, List<? super Resource> dst) {
    for (Resource r : src) dst.add(r);
}
```

- `List<? extends Resource>` — you can **read** `Resource` out, can't add (except null).
- `List<? super Resource>` — you can **add** `Resource` in, reads come back as `Object`.

## Bounded type parameters vs wildcards
- `<T extends Resource>` on a class/method means "T is fixed once chosen".
- `<? extends Resource>` on a parameter means "any subtype, I don't care which".

Use `T` when you need to **refer to the same type** in multiple places
(parameter and return). Use `?` when the type is just a one-off bound.

## The runtime trap
Generics are **erased** at runtime. `List<String>` and `List<Integer>`
are the same class. Consequences:
- You cannot `new T[]`.
- `instanceof List<String>` doesn't compile — only `instanceof List<?>`.
- Reflection sees `List`, not `List<String>` (unless you stash it on a field's generic signature).
