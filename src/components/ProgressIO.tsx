import { useRef, useState } from 'react';
import { Download, Upload, RotateCcw } from 'lucide-react';
import { useStore } from '../store/useStore';

type Status = { kind: 'idle' } | { kind: 'ok'; msg: string } | { kind: 'err'; msg: string };

export function ProgressIO() {
  const exportProgress = useStore((s) => s.exportProgress);
  const importProgress = useStore((s) => s.importProgress);
  const resetProgress = useStore((s) => s.resetProgress);
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const flash = (s: Status) => {
    setStatus(s);
    window.setTimeout(() => setStatus({ kind: 'idle' }), 2500);
  };

  const onExport = () => {
    const snap = exportProgress();
    const blob = new Blob([JSON.stringify(snap, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `apphome-progress-${stamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
    flash({ kind: 'ok', msg: 'Exported.' });
  };

  const onImportClick = () => fileRef.current?.click();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const ok = importProgress(parsed);
      flash(ok ? { kind: 'ok', msg: 'Imported.' } : { kind: 'err', msg: 'Unrecognised file.' });
    } catch {
      flash({ kind: 'err', msg: 'Invalid JSON.' });
    }
  };

  const onReset = () => {
    if (!window.confirm('Reset all progress on this device? This cannot be undone.')) return;
    resetProgress();
    flash({ kind: 'ok', msg: 'Reset.' });
  };

  return (
    <div className="flex flex-col gap-1 text-[11px]">
      <div className="text-slate-500 px-2 mb-1">Progress (this device)</div>
      <div className="flex gap-1 px-1">
        <button
          onClick={onExport}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded bg-ink-800 text-slate-300 hover:bg-ink-700 hover:text-slate-100"
          title="Download progress as JSON"
        >
          <Download size={12} /> Export
        </button>
        <button
          onClick={onImportClick}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded bg-ink-800 text-slate-300 hover:bg-ink-700 hover:text-slate-100"
          title="Load progress from a JSON file"
        >
          <Upload size={12} /> Import
        </button>
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-1 px-2 py-1.5 rounded bg-ink-800 text-slate-500 hover:bg-red-900/40 hover:text-red-300"
          title="Reset all progress"
        >
          <RotateCcw size={12} />
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={onFileChange}
      />
      {status.kind !== 'idle' && (
        <div
          className={
            'px-2 mt-1 ' +
            (status.kind === 'ok' ? 'text-emerald-400' : 'text-red-400')
          }
        >
          {status.msg}
        </div>
      )}
    </div>
  );
}
