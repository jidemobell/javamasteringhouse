# Phase 3 — Run Instructions

## Prerequisites

- Your AI tool, ideally an agent with edit + run-command access.
- The scratch project from Phase 1 (`~/ai-scratch`).

## Driving a live agent loop (optional but recommended)

1. Pick one task from this phase's exercises.
2. Send the agent your task + DoD.
3. When it returns a plan, **stop it** and read the plan first.
4. If the plan is bad, reject with a one-sentence reason and ask for a new plan.
5. Approve, let it work, then run its verification claims yourself.

## The redirection drill

When the agent gets something wrong (it will):

- ✗ "That's wrong." → ✗
- ✗ "Try again." → ✗
- ✓ "The failure is in `X`; the acceptance criteria says `Y`; fix `X` only."

## Time budget

A healthy loop is *mostly you thinking, briefly the agent acting*. If a single
task is taking more than a few agent turns, the task is too big — split it.

## Verifying "done" claims

Run the commands the agent claims passed. This is non-negotiable: a DoD you
don't execute is a wish. Use a scratch directory so a bad claim can't hurt
anything real.
