## The Prompt Contract — a prompt is a spec, not a sentence

An AI model does not ask clarifying questions. It produces the most likely
completion of whatever text you gave it. That means **every ambiguity in your
prompt becomes a guess the model makes for you** — and it will make that guess
with total confidence.

The fix is to treat prompts the way this platform taught you to treat
classes: **write the contract first.**

---

## The four parts

A prompt-contract has four sections. If you have only one, you have a wish.

### 1. Intent

What problem are you solving, in one or two sentences. Not "the API" — *"the
login endpoint currently blocks on a remote call; I want it to fail fast."*

> If you cannot state the intent in one or two sentences, you do not have a
> task yet. You have a mood.

### 2. Context

Everything the model must know that it cannot infer: file layout, relevant
types, naming conventions, the constraint that got you here. Context is the
part beginners skip because it's tedious — and it's the part that separates
"implement X" from "implement X the way it fits *this* codebase."

### 3. Constraints

What the answer **must not** do. This is the inverse of intent and just as
important: no new dependencies, no touching the public API, no behavior
change outside the stated scope. A constraint is a *not-in-scope* bullet from
the [Specification Pattern](concepts/specification-pattern) playbook.

### 4. Acceptance criteria

How you will check the result. Tests to pass, commands to run, properties to
hold. Without this, the model's "done" is its own definition — and its
definition is always "output produced."

---

## The three failure modes

| Failure mode | Symptom | Fix |
|---|---|---|
| Missing context | The model guesses your entities, names, error policy | State the shape explicitly; paste the relevant file |
| Underspecified intent | It "refactors" something you never asked to change | Pin the behavior that must stay identical |
| No acceptance criteria | It declares itself done | List the test/command that defines done |

These map 1:1 to the four parts. A prompt with all four is hard to get wrong.

---

## The self-check trick

The cheapest way to close a contract gap is to hand the gap-finding to the
machine:

> *"Before you start, list any assumptions you're making and any context
> you're missing. Do not write code until I confirm."*

This converts a one-shot guess into a negotiation. If the model names an
assumption that is wrong, you just found a hole in your contract for free.

---

## Prompt contracts vs code contracts

| | Code contract (class) | Prompt contract (task) |
|---|---|---|
| Written before | the code | the delegation |
| Freezes | behavior of a class | behavior of a task |
| Verified by | tests | acceptance criteria you run |
| The trap | implementation-detail tests | context-free wishes |

Same discipline, same shape. The [Testing](concepts/testing) concept's
definition of a contract — *decisions you're freezing* — applies verbatim to a
prompt. Each sentence in a prompt is a decision; each missing sentence is a
decision the model makes alone.

---

## Mental checklist

- [ ] Intent: one or two sentences, and it names the problem, not the request?
- [ ] Context: does the model have everything it can't infer?
- [ ] Constraints: did I say what it must *not* do?
- [ ] Acceptance: is "done" defined by something I can run?
- [ ] Would I hand this to a junior engineer with a straight face?
