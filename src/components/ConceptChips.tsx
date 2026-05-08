import { Link } from 'react-router-dom';
import { conceptsById } from '../concepts';
import { useStore } from '../store/useStore';
import { cn } from '../lib/cn';

interface Props {
  ids: string[];
  className?: string;
}

/**
 * Inline list of concept "chips" rendered above a phase or task brief.
 * Clicking opens the concept page; concepts the user has already seen
 * are dimmed slightly so unseen ones stand out.
 */
export function ConceptChips({ ids, className }: Props) {
  const seen = useStore((s) => s.conceptsSeen);
  if (ids.length === 0) return null;
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {ids.map((id) => {
        const c = conceptsById[id];
        if (!c) return null;
        return (
          <Link
            key={id}
            to={`/concepts/${id}`}
            title={c.oneLiner}
            className={cn(
              'text-xs px-2.5 py-1 rounded-full border transition',
              seen[id]
                ? 'border-ink-800 bg-ink-900 text-slate-400 hover:text-slate-200'
                : 'border-accent/40 bg-accent/10 text-accent hover:bg-accent/20'
            )}
          >
            {c.title}
          </Link>
        );
      })}
    </div>
  );
}
