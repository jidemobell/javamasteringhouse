import { Link, useParams, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { conceptsById, concepts } from '../concepts';
import { tracksById } from '../tracks';
import { Markdown } from '../components/Markdown';
import { useStore } from '../store/useStore';

export function ConceptPage() {
  const { conceptId } = useParams<{ conceptId: string }>();
  const concept = conceptId ? conceptsById[conceptId] : undefined;
  const markSeen = useStore((s) => s.markConceptSeen);

  useEffect(() => {
    if (concept) markSeen(concept.id);
  }, [concept, markSeen]);

  if (!concept) return <Navigate to="/concepts" replace />;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <Link
        to="/concepts"
        className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1"
      >
        <ArrowLeft size={12} /> All concepts
      </Link>
      <div className="mt-2 mb-1 text-[11px] uppercase tracking-wider text-slate-500">
        {concept.category}
      </div>
      <h1 className="text-2xl font-semibold text-slate-100">{concept.title}</h1>
      <p className="text-slate-400 mt-1">{concept.oneLiner}</p>

      <div className="mt-6">
        <Markdown source={concept.body} />
      </div>

      {concept.appearsIn.length > 0 && (
        <div className="mt-10 pt-6 border-t border-ink-800">
          <div className="text-xs uppercase tracking-wider text-slate-500 mb-3">
            Appears in
          </div>
          <ul className="space-y-1 text-sm">
            {concept.appearsIn.map((a, i) => {
              const t = tracksById[a.trackId];
              const p = t.phases.find((ph) => ph.id === a.phaseId);
              if (!p) return null;
              return (
                <li key={i}>
                  <Link
                    to={`/track/${t.id}/${p.id}`}
                    className="text-accent hover:underline"
                  >
                    {t.name} → {p.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {concept.sourceRef && (
        <div className="mt-6 text-[11px] text-slate-600 font-mono">
          ref: {concept.sourceRef}
        </div>
      )}
    </div>
  );
}

export function ConceptsListPage() {
  const seen = useStore((s) => s.conceptsSeen);
  const grouped = concepts.reduce<Record<string, typeof concepts>>((acc, c) => {
    (acc[c.category] ||= []).push(c);
    return acc;
  }, {});
  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-semibold text-slate-100">Concept Library</h1>
      <p className="text-slate-400 mt-1">
        Cross-cutting patterns and primitives. Click any chip while inside a
        phase to land here.
      </p>

      {Object.entries(grouped).map(([cat, list]) => (
        <section key={cat} className="mt-8">
          <div className="text-xs uppercase tracking-wider text-slate-500 mb-3">
            {cat}
          </div>
          <div className="space-y-2">
            {list.map((c) => (
              <Link
                key={c.id}
                to={`/concepts/${c.id}`}
                className="block p-4 rounded-lg border border-ink-800 bg-ink-900 hover:border-accent/40"
              >
                <div className="flex items-center gap-2">
                  <span className="text-slate-100 font-medium">{c.title}</span>
                  {seen[c.id] && (
                    <span className="text-[10px] uppercase tracking-wider text-emerald-400/70">
                      seen
                    </span>
                  )}
                </div>
                <div className="text-sm text-slate-400 mt-1">{c.oneLiner}</div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
