import type { Concept } from '../types';

import templateMethodMd from '../../content/concepts/template-method.md?raw';
import memoryManagementMd from '../../content/concepts/memory-management.md?raw';
import dsaPolicyMd from '../../content/concepts/dsa-policy.md?raw';
import raceConditionsMd from '../../content/concepts/race-conditions.md?raw';
import deadlocksMd from '../../content/concepts/deadlocks.md?raw';
import executorServiceMd from '../../content/concepts/executor-service.md?raw';
import builderPatternMd from '../../content/concepts/builder-pattern.md?raw';
import genericsWildcardsMd from '../../content/concepts/generics-wildcards.md?raw';
import healthChecksMd from '../../content/concepts/health-checks.md?raw';
import connectionPoolingMd from '../../content/concepts/connection-pooling.md?raw';
import kafkaMd from '../../content/concepts/kafka-producer-consumer.md?raw';
import provenanceMd from '../../content/concepts/provenance-and-merge.md?raw';
import testingMd from '../../content/concepts/testing.md?raw';
import specificationPatternMd from '../../content/concepts/specification-pattern.md?raw';

export const concepts: Concept[] = [
  {
    id: 'template-method',
    title: 'Template Method',
    oneLiner: 'Fix the algorithm skeleton in a base class; let subclasses fill the variable step.',
    category: 'pattern',
    body: templateMethodMd,
    appearsIn: [
      { trackId: 'nexus', phaseId: 'phase-2', taskId: 'super-collector' },
      { trackId: 'meridian', phaseId: 'collectors' },
    ],
    sourceRef: 'general-knowlegde/projects/nexus-route-topology-simulator/phase2-inheritance-and-interfaces.md',
  },
  {
    id: 'memory-management',
    title: 'Memory Management & Heap Dump Analysis',
    oneLiner: 'Diagnose memory issues, analyze heap dumps, and write memory-aware Java code.',
    category: 'java',
    body: memoryManagementMd,
    appearsIn: [
      { trackId: 'nexus', phaseId: 'phase-3' },
      { trackId: 'meridian', phaseId: 'collectors' },
    ],
    sourceRef: 'general-knowlegde/heap-dump-analysis.md',
  },
  {
    id: 'dsa-policy',
    title: 'DSA & Policy Management',
    oneLiner: 'Build, load, and test custom event-processing policies and adapters.',
    category: 'architecture',
    body: dsaPolicyMd,
    appearsIn: [
      { trackId: 'nexus', phaseId: 'phase-4' },
      { trackId: 'meridian', phaseId: 'collectors' },
    ],
    sourceRef: 'general-knowlegde/dsa-policy.md',
  },
  {
    id: 'race-conditions',
    title: 'Race Conditions',
    oneLiner: 'Two threads, one field, no happens-before. Fix with atomicity, isolation, or a single mutator.',
    category: 'concurrency',
    body: raceConditionsMd,
    appearsIn: [
      { trackId: 'nexus', phaseId: 'phase-3' },
      { trackId: 'meridian', phaseId: 'topology-service' },
    ],
    sourceRef: 'general-knowlegde/race-conditions.md',
  },
  {
    id: 'deadlocks',
    title: 'Deadlocks',
    oneLiner: 'Break circular wait by always acquiring locks in a globally consistent order.',
    category: 'concurrency',
    body: deadlocksMd,
    appearsIn: [
      { trackId: 'nexus', phaseId: 'phase-3' },
      { trackId: 'meridian', phaseId: 'merge-service' },
    ],
  },
  {
    id: 'executor-service',
    title: 'ExecutorService & Thread Pools',
    oneLiner: 'Stop calling `new Thread()`. Pick a pool that matches the workload, name your threads, shut down properly.',
    category: 'concurrency',
    body: executorServiceMd,
    appearsIn: [
      { trackId: 'nexus', phaseId: 'phase-3.5' },
      { trackId: 'meridian', phaseId: 'poller-service' },
    ],
  },
  {
    id: 'builder-pattern',
    title: 'Builder Pattern',
    oneLiner: 'Tame constructors with 7+ parameters. Make objects immutable. Validate in build().',
    category: 'pattern',
    body: builderPatternMd,
    appearsIn: [
      { trackId: 'nexus', phaseId: 'phase-1' },
      { trackId: 'meridian', phaseId: 'topology-service' },
    ],
  },
  {
    id: 'generics-wildcards',
    title: 'Generics & Wildcards (PECS)',
    oneLiner: 'Producer Extends, Consumer Super. Bounded generics keep the contract while allowing flexibility.',
    category: 'language',
    body: genericsWildcardsMd,
    appearsIn: [
      { trackId: 'nexus', phaseId: 'phase-1' },
    ],
  },
  {
    id: 'health-checks',
    title: 'Health Checks (Liveness vs Readiness)',
    oneLiner: 'Liveness restarts the process; readiness pulls it from traffic. They are not the same check.',
    category: 'architecture',
    body: healthChecksMd,
    appearsIn: [
      { trackId: 'meridian', phaseId: 'status-service' },
    ],
  },
  {
    id: 'connection-pooling',
    title: 'Connection Pooling',
    oneLiner: 'A finite, configured pool. Bigger is not better. Always close (return) the connection.',
    category: 'architecture',
    body: connectionPoolingMd,
    appearsIn: [
      { trackId: 'nexus', phaseId: 'phase-4' },
      { trackId: 'meridian', phaseId: 'inventory-service' },
    ],
  },
  {
    id: 'kafka-producer-consumer',
    title: 'Kafka — Producer/Consumer Done Right',
    oneLiner: 'Idempotent producer + at-least-once consumer + idempotent downstream = pragmatic exactly-once.',
    category: 'architecture',
    body: kafkaMd,
    appearsIn: [
      { trackId: 'nexus', phaseId: 'phase-5' },
      { trackId: 'meridian', phaseId: 'replication-worker' },
    ],
  },
  {
    id: 'provenance-and-merge',
    title: 'Provenance & Merge Strategies',
    oneLiner: 'Don\'t lose data — attribute it. Every field carries its source, time, and confidence.',
    category: 'architecture',
    body: provenanceMd,
    appearsIn: [
      { trackId: 'nexus', phaseId: 'phase-6' },
      { trackId: 'meridian', phaseId: 'merge-service' },
    ],
  },
  {
    id: 'testing',
    title: 'Testing — Contracts, Not Code',
    oneLiner: 'Tests freeze decisions and document behavior. Test the contract, not the implementation.',
    category: 'practice',
    body: testingMd,
    appearsIn: [
      { trackId: 'nexus', phaseId: 'phase-1' },
      { trackId: 'nexus', phaseId: 'phase-2' },
      { trackId: 'nexus', phaseId: 'phase-3' },
      { trackId: 'meridian', phaseId: 'topology-service' },
    ],
  },
  {
    id: 'specification-pattern',
    title: 'Specification Pattern',
    oneLiner: 'A host should not contain a question it can ask someone else. Lift yes/no decisions into a tiny interface.',
    category: 'pattern',
    body: specificationPatternMd,
    appearsIn: [
      { trackId: 'nexus', phaseId: 'phase-2.5' },
    ],
  },
];

export const conceptsById: Record<string, Concept> = Object.fromEntries(
  concepts.map((c) => [c.id, c]),
);
