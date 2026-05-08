## The pain
```java
new CiscoDevice(id, hostname, ip, snmpVer, community, port, timeoutMs,
                retries, region, tier, tags, lastSeen); // good luck
```

## The fix
```java
CiscoDevice d = CiscoDevice.builder()
    .id("R-42")
    .hostname("core-rtr-1")
    .ip("10.0.0.1")
    .snmp(v -> v.version(3).community("public"))
    .timeoutMs(2000)
    .build();
```

### Rules that make a builder *good* and not just verbose
1. The result is **immutable** — no setters on `CiscoDevice` itself.
2. `build()` validates invariants and **throws** if violated. Don't half-construct.
3. Required fields go in the static factory `builder(id)`; optional ones are fluent setters.
4. Use Lombok `@Builder` only when the team is on board with Lombok — otherwise hand-roll. The boilerplate is one-time.

### When *not* to use Builder
- 1–3 fields. Just use a constructor or record.
- The object is mutable by design. Builder is for *building*, not editing.
