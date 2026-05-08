import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/cn';
import { Layers, BookOpen, Compass, Home, BookMarked, Zap, Shield } from 'lucide-react';
import { ProgressIO } from './ProgressIO';

const items = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/how-to-use', label: 'How to use', icon: BookMarked },
  { to: '/track/nexus', label: 'Nexus (phased)', icon: Layers },
  { to: '/track/meridian', label: 'Meridian (project)', icon: Compass },
  { to: '/track/flux', label: 'Flux (reactive)', icon: Zap },
  { to: '/track/sentinel', label: 'Sentinel (security)', icon: Shield },
  { to: '/concepts', label: 'Concepts', icon: BookOpen },
];

export function Sidebar() {
  const { pathname } = useLocation();
  return (
    <aside className="w-60 shrink-0 border-r border-ink-800 bg-ink-900 p-4 flex flex-col gap-1 overflow-y-auto">
      <div className="px-2 py-3 mb-2">
        <div className="text-lg font-semibold text-slate-100">AppHome</div>
        <div className="text-xs text-slate-500">Java mastery, mid → advanced</div>
      </div>
      {items.map(({ to, label, icon: Icon }) => {
        const active =
          to === '/' ? pathname === '/' : pathname.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-md text-sm',
              active
                ? 'bg-ink-800 text-accent'
                : 'text-slate-400 hover:bg-ink-800 hover:text-slate-200'
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        );
      })}
      <div className="mt-auto pt-4 border-t border-ink-800 flex flex-col gap-3">
        <ProgressIO />
        <div className="text-[11px] text-slate-500 px-2">
          Sources: <code className="text-slate-400">general-knowlegde/</code>{' '}
          and <code className="text-slate-400">mini-asm/projectcore/</code>
        </div>
      </div>
    </aside>
  );
}
