# Phase 2 — Run Instructions

## Prerequisites

- A text editor with a monospace font (the app's editor pane counts).
- Optionally: your real AI tool to A/B test your prompts against the reference.

## How to practice a prompt-contract

1. **Write your version** in the task editor. Target: 4 parts visible
   (intent, context, constraints, acceptance criteria).
2. **Read the reference** only after you've written yours.
3. **Run the A/B test** (recommended): send *your* prompt to your AI tool,
   then send the *reference* prompt to a fresh chat. Compare the two outputs.
   The difference in quality is the point of this phase made visible.

## Scoring your own prompt

Before you mark a task solved, ask:

- [ ] Could a junior engineer implement this without asking a single question?
- [ ] Did I name what the result must *not* do, not just what it must do?
- [ ] Is "done" defined by something checkable (test, command, property)?
- [ ] Would this prompt survive being given to a different AI tool tomorrow?

## If the tool still gets it wrong

Don't blame the tool — amend the contract. The loop is:

1. Tell it what's wrong in one sentence ("the error handling is missing").
2. Ask it to re-read the acceptance criteria.
3. If it repeats the mistake, add an explicit *not-in-scope* bullet.
