import { useEffect, useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowLeft, Terminal, ChevronDown, ChevronRight, Download } from 'lucide-react';
import { tracksById } from '../tracks';
import { Markdown } from '../components/Markdown';
import { ConceptChips } from '../components/ConceptChips';
import { CodeEditor } from '../components/CodeEditor';
import { track } from '../lib/analytics';
import type { TrackId } from '../types';

export function PhasePage() {
  const { trackId, phaseId } = useParams<{ trackId: TrackId; phaseId: string }>();
  const trackData = trackId ? tracksById[trackId] : undefined;
  const phase = trackData?.phases.find((p) => p.id === phaseId);

  const [activeTaskId, setActiveTaskId] = useState<string | null>(
    phase?.tasks[0]?.id ?? null
  );
  const [runOpen, setRunOpen] = useState(false);

  useEffect(() => {
    if (trackData && phase) {
      track('phase_opened', { track: trackData.id, phase: phase.id });
    }
  }, [trackData, phase]);

  useEffect(() => {
    if (trackData && phase && activeTaskId) {
      track('task_opened', { track: trackData.id, phase: phase.id, task: activeTaskId });
    }
  }, [trackData, phase, activeTaskId]);

  if (!trackData || !phase) return <Navigate to="/" replace />;
  const track_ = trackData;

  const activeTask = phase.tasks.find((t) => t.id === activeTaskId) ?? null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-ink-800 bg-ink-900 px-6 py-4">
        <Link
          to={`/track/${track_.id}`}
          className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1"
        >
          <ArrowLeft size={12} /> {track_.name}
        </Link>
        <div className="flex items-baseline gap-3 mt-1">
          <span className="text-slate-500 font-mono text-sm">
            Phase {phase.index}
          </span>
          <h1 className="text-xl font-semibold text-slate-100">{phase.title}</h1>
          <span className="text-sm text-slate-500">— {phase.subtitle}</span>
        </div>
        {phase.concepts.length > 0 && (
          <div className="mt-3">
            <ConceptChips ids={phase.concepts} />
          </div>
        )}
        {phase.sourceRef && (
          <div className="mt-2 text-[11px] text-slate-600 font-mono">
            ref: {phase.sourceRef}
          </div>
        )}
      </div>

      {/* Body: brief left, editor right (when a task is active) */}
      <div className="flex-1 min-h-0 flex">
        <div className="w-[480px] shrink-0 overflow-y-auto border-r border-ink-800 p-6">
          <Markdown source={phase.overview} />

          {phase.runInstructions && (
            <div className="mt-6 rounded border border-ink-800 bg-ink-900/60">
              <div className="flex items-stretch">
                <button
                  onClick={() => {
                    const next = !runOpen;
                    setRunOpen(next);
                    if (next) {
                      track('run_instructions_opened', {
                        track: track_.id,
                        phase: phase.id,
                      });
                    }
                  }}
                  className="flex-1 flex items-center justify-between px-3 py-2 text-sm text-slate-200 hover:bg-ink-800/60"
                >
                  <span className="flex items-center gap-2">
                    <Terminal size={14} className="text-accent" />
                    How to run this locally
                  </span>
                  {runOpen ? (
                    <ChevronDown size={14} className="text-slate-500" />
                  ) : (
                    <ChevronRight size={14} className="text-slate-500" />
                  )}
                </button>
                {phase.starterZip && (
                  <a
                    href={`/starters/${phase.starterZip}`}
                    download
                    onClick={() => {
                      track('starter_downloaded', {
                        track: track_.id,
                        phase: phase.id,
                        file: phase.starterZip!,
                      });
                    }}
                    className="flex items-center gap-1.5 px-3 border-l border-ink-800 text-xs text-accent hover:bg-accent/10"
                    title="Download starter project as ZIP"
                  >
                    <Download size={12} />
                    Starter
                  </a>
                )}
              </div>
              {runOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-ink-800">
                  <Markdown source={phase.runInstructions} />
                </div>
              )}
            </div>
          )}

          {phase.tasks.length > 0 && (
            <div className="mt-6">
              <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">
                Tasks
              </div>
              <div className="space-y-1">
                {phase.tasks.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTaskId(t.id)}
                    className={`w-full text-left px-3 py-2 rounded text-sm border ${
                      activeTaskId === t.id
                        ? 'border-accent/50 bg-accent/10 text-accent'
                        : 'border-ink-800 bg-ink-900 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {t.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTask && (
            <div className="mt-6 pt-6 border-t border-ink-800">
              <h3 className="text-base font-semibold text-slate-100 mb-2">
                {activeTask.title}
              </h3>
              {activeTask.concepts.length > 0 && (
                <ConceptChips ids={activeTask.concepts} className="mb-3" />
              )}
              <Markdown source={activeTask.brief} />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 p-4">
          {activeTask && activeTask.samples[0] ? (
            <CodeEditor
              trackId={track_.id}
              phaseId={phase.id}
              taskId={activeTask.id}
              sample={activeTask.samples[0]}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">
              {phase.tasks.length === 0
                ? 'Reading-only phase. Tasks for this phase are coming soon — see the source ref above for the full markdown.'
                : 'Select a task to start typing.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
