## topology-service

Owns the graph. Vertices and edges are immutable; mutations go through the
service, not directly to JanusGraph. This is where Builder pays off — the
domain objects are 8-10 fields with strict invariants.
