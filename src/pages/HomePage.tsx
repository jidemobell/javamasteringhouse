import { Link } from 'react-router-dom';
import { Layers, Compass, BookOpen, ArrowRight } from 'lucide-react';
import { tracks } from '../tracks';
import { concepts } from '../concepts';

export function HomePage() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold text-slate-100">
          A platform for the Java I actually use at work.
        </h1>
        <p className="mt-3 text-slate-400 leading-relaxed">
          Mid-to-advanced Java by building, not by watching. Two tracks share one
          concept library — pick how you want to learn today.
        </p>
      </header>

      <section className="grid md:grid-cols-2 gap-4">
        {tracks.map((t) => {
          const Icon = t.mode === 'phased' ? Layers : Compass;
          return (
            <Link
              key={t.id}
              to={`/track/${t.id}`}
              className="group p-6 rounded-xl border border-ink-800 bg-ink-900 hover:border-accent/50 transition"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-md bg-accent/10 text-accent">
                  <Icon size={20} />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-500">
                    Track {t.id === 'nexus' ? 'A' : 'B'} · {t.mode}
                  </div>
                  <div className="text-lg font-semibold text-slate-100">{t.name}</div>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">{t.tagline}</p>
              <div className="mt-4 text-xs text-slate-500">
                {t.phases.length} {t.mode === 'phased' ? 'phases' : 'modules'}
              </div>
              <div className="mt-3 inline-flex items-center gap-1 text-sm text-accent group-hover:gap-2 transition-all">
                Open track <ArrowRight size={14} />
              </div>
            </Link>
          );
        })}
      </section>

      <section className="mt-10 p-6 rounded-xl border border-ink-800 bg-ink-900">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-md bg-accent-warm/10 text-accent-warm">
            <BookOpen size={20} />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-500">
              Cross-cutting
            </div>
            <div className="text-lg font-semibold text-slate-100">Concept Library</div>
          </div>
        </div>
        <p className="text-sm text-slate-400 mb-4">
          Patterns and concurrency primitives, written for someone who already
          knows the syntax and wants the *insight*. Linked from every place
          they appear in either track.
        </p>
        <div className="flex flex-wrap gap-2">
          {concepts.map((c) => (
            <Link
              key={c.id}
              to={`/concepts/${c.id}`}
              className="text-xs px-3 py-1.5 rounded-full border border-ink-800 bg-ink-800/40 text-slate-300 hover:border-accent/50 hover:text-accent"
              title={c.oneLiner}
            >
              {c.title}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
