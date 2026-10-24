# Phase 4 — Run Instructions

## Prerequisites

- Java 17+ and `javac`/`java` on the PATH (this phase uses real Java).
- The review checklist from the phase overview — keep it open.

## Run the Java exercises

Each task's starter is a self-contained Java file. Compile and run it to see
the buggy behavior before you fix it:

```shell
cd ~/ai-scratch
javac CacheCounter.java
java CacheCounter
```

## The exercise pattern

1. **Read the contract** — the task brief states what the code is *supposed*
   to do. That is your source of truth, not the code.
2. **Run it** — reproduce the wrong behavior. A bug you can demonstrate is a
   bug you understand.
3. **Find the gap** — trace the error path or the shared state.
4. **Fix it** — minimal change. Then run it again and confirm.
5. **Compare with the reference** — the reference is the fixed version *plus*
   review notes explaining why each change matters.

## If a snippet doesn't compile

That's data. A hallucinated API will fail at compile time — the compiler is
your first reviewer. Note which symbol doesn't exist and check the task's
imports against reality.

## Honest verification

- Your fix is "correct" when it passes the behavior the brief describes,
  not when it matches the reference line-for-line.
- If you fix the race but don't know *why* it was a race, re-read the
  [Race Conditions](concepts/race-conditions) concept before moving on.
