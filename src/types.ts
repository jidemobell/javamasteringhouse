// Domain types for the unified Java mastery platform.
// Tracks: 'nexus' (phased workshop), 'meridian' (project deep-dive),
//         'flux' (Spring WebFlux + Maven), 'sentinel' (Spring Security + Gradle).
// Concepts are first-class and shared across all tracks.

export type TrackId = 'nexus' | 'meridian' | 'flux' | 'sentinel';
export type Difficulty = 'entry' | 'mid' | 'intermediate' | 'advanced';

export interface ConceptRef {
  id: string;
  label: string;
}

export interface CodeSample {
  filename: string;
  language: 'java' | 'yaml' | 'gradle' | 'json' | 'shell';
  starter: string;   // what the learner sees in the editor
  reference: string; // shown when "Show solution" is toggled
}

export interface Task {
  id: string;
  title: string;
  /** Markdown brief shown above the editor */
  brief: string;
  /** Concepts surfaced as clickable callouts in the brief */
  concepts: string[];
  samples: CodeSample[];
}

export interface Phase {
  id: string;
  index: number;
  title: string;
  subtitle: string;
  difficulty: Difficulty;
  /** Markdown narrative for the phase landing screen */
  overview: string;
  concepts: string[];
  tasks: Task[];
  /** Path-style reference to source material in the workspace */
  sourceRef?: string;
  /** Markdown with prerequisites + commands to run this phase locally */
  runInstructions?: string;
  /** Filename (under /starters/) of a downloadable starter zip, e.g. 'nexus-phase-1.zip' */
  starterZip?: string;
}

export interface Track {
  id: TrackId;
  name: string;
  tagline: string;
  /** "phased" = walk Phase 1..N. "project" = pick any module, dive in. */
  mode: 'phased' | 'project';
  phases: Phase[];
}

export interface Concept {
  id: string;
  title: string;
  oneLiner: string;
  category: 'pattern' | 'concurrency' | 'language' | 'architecture' | 'practice' | 'java';
  body: string; // markdown
  /** Where this concept shows up — for cross-linking back into tracks */
  appearsIn: { trackId: TrackId; phaseId: string; taskId?: string }[];
  /** Reference path in the broader workspace (read-only pointer) */
  sourceRef?: string;
}
