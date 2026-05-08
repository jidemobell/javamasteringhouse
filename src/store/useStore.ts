import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TrackId } from '../types';

const SCHEMA_VERSION = 1;

export interface ProgressSnapshot {
  schemaVersion: number;
  exportedAt: string;
  solved: Record<string, boolean>;
  drafts: Record<string, string>;
  conceptsSeen: Record<string, boolean>;
}

interface ProgressState {
  /** Map of "<trackId>/<phaseId>/<taskId>" → boolean (true = solved) */
  solved: Record<string, boolean>;
  /** Per-task buffer of the user's in-progress code, keyed the same way */
  drafts: Record<string, string>;
  /** Concept ids the user has opened at least once */
  conceptsSeen: Record<string, boolean>;

  markSolved: (trackId: TrackId, phaseId: string, taskId: string) => void;
  saveDraft: (
    trackId: TrackId,
    phaseId: string,
    taskId: string,
    code: string
  ) => void;
  markConceptSeen: (conceptId: string) => void;

  taskKey: (trackId: TrackId, phaseId: string, taskId: string) => string;

  /** Returns the current progress as a serialisable snapshot. */
  exportProgress: () => ProgressSnapshot;
  /**
   * Replaces the current progress with the given snapshot.
   * Returns true on success, false if the payload is unrecognised.
   */
  importProgress: (raw: unknown) => boolean;
  /** Wipes solved/drafts/conceptsSeen. */
  resetProgress: () => void;
}

function isSnapshot(x: unknown): x is ProgressSnapshot {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.schemaVersion === 'number' &&
    typeof o.solved === 'object' &&
    typeof o.drafts === 'object' &&
    typeof o.conceptsSeen === 'object'
  );
}

export const useStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      solved: {},
      drafts: {},
      conceptsSeen: {},

      taskKey: (t, p, k) => `${t}/${p}/${k}`,

      markSolved: (t, p, k) =>
        set((s) => ({ solved: { ...s.solved, [get().taskKey(t, p, k)]: true } })),

      saveDraft: (t, p, k, code) =>
        set((s) => ({ drafts: { ...s.drafts, [get().taskKey(t, p, k)]: code } })),

      markConceptSeen: (id) =>
        set((s) => ({ conceptsSeen: { ...s.conceptsSeen, [id]: true } })),

      exportProgress: () => {
        const { solved, drafts, conceptsSeen } = get();
        return {
          schemaVersion: SCHEMA_VERSION,
          exportedAt: new Date().toISOString(),
          solved,
          drafts,
          conceptsSeen,
        };
      },

      importProgress: (raw) => {
        if (!isSnapshot(raw)) return false;
        if (raw.schemaVersion !== SCHEMA_VERSION) return false;
        set({
          solved: raw.solved,
          drafts: raw.drafts,
          conceptsSeen: raw.conceptsSeen,
        });
        return true;
      },

      resetProgress: () =>
        set({ solved: {}, drafts: {}, conceptsSeen: {} }),
    }),
    { name: 'apphome-progress-v1' }
  )
);
