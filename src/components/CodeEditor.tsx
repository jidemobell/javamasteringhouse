import { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Eye, EyeOff, Check, RotateCcw } from 'lucide-react';
import type { CodeSample, TrackId } from '../types';
import { useStore } from '../store/useStore';
import { track } from '../lib/analytics';

interface Props {
  trackId: TrackId;
  phaseId: string;
  taskId: string;
  sample: CodeSample;
}

/**
 * Monaco editor with:
 *  - persisted draft per (track/phase/task)
 *  - "Show reference solution" toggle that swaps to a read-only view
 *  - "Mark solved" and "Reset to starter" controls
 *
 * Designed for active typing: the learner types their own version, then
 * compares against the reference. We deliberately do NOT auto-grade —
 * the value is in *typing* the code, not passing a test.
 */
export function CodeEditor({ trackId, phaseId, taskId, sample }: Props) {
  const { saveDraft, drafts, taskKey, markSolved, solved } = useStore();
  const key = taskKey(trackId, phaseId, taskId);

  const [code, setCode] = useState(drafts[key] ?? sample.starter);
  const [showReference, setShowReference] = useState(false);

  useEffect(() => {
    setCode(drafts[key] ?? sample.starter);
    setShowReference(false);
  }, [key, sample.starter, drafts]);

  const onChange = (v: string | undefined) => {
    const next = v ?? '';
    setCode(next);
    saveDraft(trackId, phaseId, taskId, next);
  };

  const reset = () => {
    setCode(sample.starter);
    saveDraft(trackId, phaseId, taskId, sample.starter);
  };

  return (
    <div className="flex flex-col h-full border border-ink-800 rounded-lg overflow-hidden bg-ink-900">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-ink-800 bg-ink-800/60">
        <span className="text-xs font-mono text-slate-400">{sample.filename}</span>
        <span className="text-[10px] uppercase tracking-wider text-slate-500 ml-2">
          {sample.language}
        </span>
        <div className="flex-1" />
        <button
          onClick={() => {
            setShowReference((v) => {
              const next = !v;
              if (next) track('solution_revealed', { track: trackId, phase: phaseId, task: taskId });
              return next;
            });
          }}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded border border-ink-800 hover:bg-ink-800 text-slate-300"
          title="Toggle reference solution"
        >
          {showReference ? <EyeOff size={14} /> : <Eye size={14} />}
          {showReference ? 'Hide solution' : 'Show solution'}
        </button>
        <button
          onClick={reset}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded border border-ink-800 hover:bg-ink-800 text-slate-300"
          title="Reset to starter"
        >
          <RotateCcw size={14} /> Reset
        </button>
        <button
          onClick={() => {
            markSolved(trackId, phaseId, taskId);
            if (!solved[key]) track('task_marked_solved', { track: trackId, phase: phaseId, task: taskId });
          }}
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded border ${
            solved[key]
              ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
              : 'border-ink-800 hover:bg-ink-800 text-slate-300'
          }`}
        >
          <Check size={14} /> {solved[key] ? 'Solved' : 'Mark solved'}
        </button>
      </div>

      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          theme="vs-dark"
          language={sample.language}
          value={showReference ? sample.reference : code}
          onChange={showReference ? undefined : onChange}
          options={{
            readOnly: showReference,
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: 'JetBrains Mono, Menlo, monospace',
            scrollBeyondLastLine: false,
            tabSize: 4,
          }}
        />
      </div>
    </div>
  );
}
