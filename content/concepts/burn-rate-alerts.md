## Burn rate: how fast you are spending the budget

**Burn rate 1×** spends exactly the whole budget over the whole window. **Burn
rate 14.4×** spends it in about 1/14.4th of the time — for a 30-day budget, roughly
two days.

```
burn_rate = (1 - SLI) / (1 - SLO)
```

At 99.5% SLO with a current SLI of 99.0%: `0.01 / 0.005 = 2×`. You are spending
twice as fast as allowed.

### Why one window is never enough

| Window | Catches | Problem |
|---|---|---|
| 5 min only | An outage, in minutes | Fires on every brief blip; unusable |
| 1 hour only | Sustained problems | Fires 40 minutes after users noticed |
| 28 days only | Real SLO impact | Useless to wake anyone |

The fix is to require **two windows at once**: a long one proves the burn is
material, a short one proves it is still happening. Both must exceed the
threshold, so the alert resets quickly when the problem clears.

### The canonical pairs

| Severity | Long window | Short window | Burn rate | Budget spent |
|---|---|---|---|---|
| Page | 1h | 5m | 14.4× | 2% in 1h |
| Page | 6h | 30m | 6× | 5% in 6h |
| Ticket | 3d | 6h | 1× | 10% in 3d |

Start with one page pair and one ticket pair. More alerts is not more coverage —
it is more noise.

```yaml
- alert: AvailabilityFastBurn
  expr: |
    (1 - sli:ratio_1h) > (14.4 * 0.005)
    and
    (1 - sli:ratio_5m) > (14.4 * 0.005)
  for: 2m
  labels: { severity: page }
  annotations:
    runbook: "runbooks/availability.md"
```

### The tuning you will actually need

- **`for:` is detection latency.** Two minutes on an outright outage is most of
  your response budget; consider a separate `target_down` alert at `for: 30s` for
  total unavailability, and keep burn-rate for degradation.
- **Too many pages?** Raise the multiplier or lengthen the `for:`. Do not add a
  filter that hides the signal.
- **Burn rate on the 28-day window** is not an alert, it is a dashboard. It cannot
  wake anyone in time to matter.

### What to avoid

- Alerting on error *counts* (`errors > 10`). Traffic doubles, alert fires, nothing
  is wrong. Ratios survive traffic changes; counts do not.
- One alert with `severity: critical` for everything, so people mute it.
- A burn-rate alert whose runbook does not exist. The alert asks the question; the
  runbook is the only place with the answer.

### The one-sentence takeaway

**Alert on the rate of budget consumption — long window for materiality, short
window for currency — never on a raw count.**
