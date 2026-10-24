## SLI, SLO, SLA — three words people use interchangeably and shouldn't

| | SLI | SLO | SLA |
|---|---|---|---|
| What | A measurement | A target for that measurement | A contract with a consequence |
| Example | 99.72% of requests succeeded, 28d | ≥ 99.5% over 28 days | 99.5% or service credits |
| Who owns it | Engineering | Engineering + product | Legal + commercial |
| Breach means | You know | You stop shipping features | You owe money |

The rule that keeps them straight: **an SLI is always a ratio, an SLO is a
threshold on that ratio, and an SLA is an SLO with a lawyer attached.**

### The ratio form is not optional

```
availability = good events / valid events
```

- **Good** — served correctly. For an ingest API: `202`.
- **Valid** — *should* have been served. Malformed client input is not valid; it
  is not your unavailability, and counting it lets any caller burn your budget.
- **Window** — the period the judgement applies to. 28 days is common because it
  smooths weekly traffic cycles.

Anything that cannot be expressed this way is not an SLI. "Number of errors" is a
count. "99.9% uptime" with no window is a slogan.

### Latency SLIs: two valid shapes, one that suits budgets

```promql
# Share of users who got a fast response — ratio form, feeds an error budget.
sum(rate(http_duration_bucket{le="0.25"}[5m]))
/
sum(rate(http_duration_bucket{le="+Inf"}[5m]))

# The 95th percentile — useful to describe, hard to budget.
histogram_quantile(0.95, sum(rate(http_duration_bucket[5m])) by (le))
```

A percentile is not a share of users. You cannot say "3% of my budget was spent on
p95". Use the ratio for the SLO, and the percentile for context.

### What to avoid

- **Averaging latency.** One 5s request in a hundred at 20ms averages to 70ms — a
  number describing nobody.
- **100% targets.** Unaffordable, and they make shipping the enemy. Set the SLO
  just below what you currently deliver, then improve deliberately.
- **SLOs nobody can act on.** If exceeding the budget changes nothing, it is a
  dashboard, not an objective.
- **Using `up` as an SLI.** `up` measures whether Prometheus reached your service,
  not whether users were served.

### The one-sentence takeaway

**Define the ratio first — good over valid, over a stated window — because every
target, alert and budget downstream is arithmetic on that fraction.**
