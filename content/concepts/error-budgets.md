## The error budget is the permission to take risk

An SLO of 99.5% is a statement that **0.5% unavailability is acceptable**. That
0.5% is not a margin for error — it is a budget you are allowed to spend on
shipping.

### The arithmetic

| Target | Budget | Over 28 days |
|---|---|---|
| 99% | 1% | ≈ 6h 43m |
| 99.5% | 0.5% | ≈ 3h 22m |
| 99.9% | 0.1% | ≈ 40 min |
| 99.95% | 0.05% | ≈ 20 min |

Work it out with `window_minutes × (1 − target)`, not by feel. Being able to do
this on paper in an interview is a credibility marker.

### Why it changes behaviour

Without a budget, "should we ship?" is a negotiation between the person who wants
the feature and the person who fears the page. With a budget it is arithmetic:

- Budget remaining → ship, and take the risk knowingly.
- Budget exhausted → reliability work until back inside target. Not a punishment;
  a pre-agreed allocation of effort.

This is the whole point: **the budget converts an argument into a number.**

```promql
# Remaining budget as a ratio: 1.0 = full, 0 = exhausted, <0 = breached.
1 - (
  (1 - sli_availability:ratio_28d) / (1 - 0.995)
)
```

### The policy is the artifact

A budget with no consequence is decoration. Write down, in advance:

| Threshold | What changes |
|---|---|
| 75% spent | Review; rollback plan required for the next deploy |
| 100% spent | Feature deploys stop; reliability work only |
| Breached | Postmortem mandatory; re-examine the target itself |

Two details that catch people out:

- **Planned maintenance spends budget.** If you exclude it, the budget measures
  "unplanned pain" and quietly lies about user experience.
- **Dependency outages you correctly report count.** The user saw a failure.

### What to avoid

- Budgets computed from `up`. That is scraper health, not service health.
- Retroactively adjusting the target after a bad month. That is not a policy, it
  is a cover-up, and it teaches the team the number is fictional.
- A budget so large it never binds (99% on a low-traffic internal service). It
  becomes a number nobody consults.

### The one-sentence takeaway

**Pick a target you can afford, compute what it buys in minutes, and decide in
advance what spending all of it changes.**
