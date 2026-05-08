## layout-service

Computes 2D coordinates for the topology. Layout is expensive → cache with
a TTL and invalidate on topology change events from Kafka.
