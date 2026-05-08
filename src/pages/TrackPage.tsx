import { Link, useParams, Navigate } from 'react-router-dom';
import { tracksById } from '../tracks';
import { ChevronRight, CheckCircle2, Circle } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { TrackId } from '../types';

export function TrackPage() {
  const { trackId } = useParams<{ trackId: TrackId }>();
  const track = trackId ? tracksById[trackId] : undefined;
  const solved = useStore((s) => s.solved);

  if (!track) return <Navigate to="/" replace />;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-wider text-slate-500">
          Track · {track.mode}
        </div>
        <h1 className="text-2xl font-semibold text-slate-100 mt-1">{track.name}</h1>
        <p className="text-slate-400 mt-2">{track.tagline}</p>
        {track.mode === 'project' && (
          <p className="text-xs text-slate-500 mt-3 italic">
            Project mode: phases are independent. Pick whichever answers a
            question you have right now.
          </p>
        )}
      </div>

      <ol className="space-y-2">
        {track.phases.map((phase) => {
          const taskCount = phase.tasks.length;
          const doneCount = phase.tasks.filter(
            (t) => solved[`${track.id}/${phase.id}/${t.id}`]
          ).length;
          const allDone = taskCount > 0 && doneCount === taskCount;
          return (
            <li key={phase.id}>
              <Link
                to={`/track/${track.id}/${phase.id}`}
                className="flex items-center gap-4 p-4 rounded-lg border border-ink-800 bg-ink-900 hover:border-accent/40 transition"
              >
                <div className="text-slate-500 font-mono w-8 text-right">
                  {String(phase.index).padStart(2, '0')}
                </div>
                {allDone ? (
                  <CheckCircle2 className="text-emerald-400" size={18} />
                ) : (
                  <Circle className="text-slate-600" size={18} />
                )}
                <div className="flex-1">
                  <div className="text-slate-100 font-medium">{phase.title}</div>
                  <div className="text-xs text-slate-500">{phase.subtitle}</div>
                </div>
                <div className="text-xs text-slate-500">
                  {taskCount > 0 ? `${doneCount}/${taskCount} tasks` : 'reading'}
                </div>
                <span
                  className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded ${
                    phase.difficulty === 'advanced'
                      ? 'bg-accent-warm/10 text-accent-warm'
                      : 'bg-accent/10 text-accent'
                  }`}
                >
                  {phase.difficulty}
                </span>
                <ChevronRight size={16} className="text-slate-600" />
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
