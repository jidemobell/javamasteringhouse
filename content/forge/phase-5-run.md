# Phase 5 — Run Instructions

## Prerequisites

- Everything from Phases 1–4. This phase is judgment, not tooling.
- A text editor (markdown) for the policy and pipeline tasks.

## How to validate your delegation policy

1. Write your policy in the task editor.
2. **Stress-test it** with a real recent memory: pick a task you did last
   week, and run it through your matrix. Where did your matrix disagree with
   what you actually did?
3. Amend the policy. A policy that doesn't survive contact with your own
   history is decoration.

## Designing the release pipeline

For the pipeline task, mermaid diagrams render in the overview pane. Your
diagram is the deliverable — nodes are *handoffs* and *gates*, not just steps:

- Every handoff must name its contract (what is handed over).
- Every gate must name its DoD (how it's checked).
- If a node has no DoD, it isn't a gate — it's a wish.

## The per-file decision drill

For the per-file task, be honest about *why* each file is delegated or kept.
"Because it's simple" is not a reason — simple files still carry requirements
you own. Reason from the four human-only decisions.

## When you're done with this track

You should be able to:

- Write a prompt-contract from memory (intent, context, constraints, DoD).
- Decompose a feature into task-shaped work before the agent starts.
- Review AI output against a checklist, not by feel.
- Say, out loud, which parts of your work you will never delegate.

That's the paradigm. The tooling changes every quarter; the loop doesn't.
