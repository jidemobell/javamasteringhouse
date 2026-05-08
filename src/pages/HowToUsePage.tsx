import howToUseMd from '../../content/how-to-use.md?raw';
import { Markdown } from '../components/Markdown';

export function HowToUsePage() {
  return (
    <div className="max-w-3xl mx-auto p-8">
      <header className="mb-6">
        <div className="text-xs uppercase tracking-wider text-slate-500">
          Orientation
        </div>
        <h1 className="text-3xl font-semibold text-slate-100 mt-1">
          How to use this platform
        </h1>
      </header>
      <Markdown source={howToUseMd} />
    </div>
  );
}
