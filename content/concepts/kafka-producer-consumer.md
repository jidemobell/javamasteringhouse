## Topics aren't queues — they're append-only logs

A queue: read consumes the message. A topic: read advances *your* offset;
the message stays. Anyone else with a different consumer group reads the
same data independently. This is why Kafka scales horizontally for fan-out.

## Partitioning is your scaling unit

A topic with 6 partitions can be consumed by **at most 6** consumers in one
group, in parallel. Choose your partition key carefully:

```java
// Good: same resource id always lands on same partition,
// so its events stay ordered for any consumer.
producer.send(new ProducerRecord<>("topology.input", resource.getId(), json));
```

Bad partition keys: `null` (round-robin, no ordering), timestamps (hot
partition), random (defeats ordering entirely).

## Idempotent producer — turn it on

```java
props.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, "true");
props.put(ProducerConfig.ACKS_CONFIG, "all");
props.put(ProducerConfig.RETRIES_CONFIG, Integer.MAX_VALUE);
```

Kafka will dedupe retries within a producer session. This is the closest
thing to "exactly once" you'll get from the producer side.

## Consumer offset commit — pick one strategy and commit to it

| Strategy | When to use |
|---|---|
| `enable.auto.commit=true` | Never. You don't know what was actually processed. |
| Manual `commitSync()` after processing | Default for "at-least-once" with dedupe downstream. |
| Manual `commitAsync()` | Higher throughput, accept rare double-commit. |
| Transactional (read-process-write) | Required for "exactly once" across topics. |

## At-least-once + idempotent consumer is the pragmatic answer

"Exactly once" is mostly marketing. In real systems:
1. Consumer reads, processes, **then** commits offset.
2. If it crashes after processing but before commit, the next consumer re-reads.
3. Therefore **the consumer's downstream write must be idempotent** (UPSERT
   by id, not blind INSERT).

That's the whole pattern. Memorize it.
