import { useEffect, useId, useRef, useState } from 'react';
import type { Mermaid } from 'mermaid';
import { Maximize2, X } from 'lucide-react';

let mermaidPromise: Promise<Mermaid> | null = null;

function loadMermaid(): Promise<Mermaid> {
  if (mermaidPromise) return mermaidPromise;
  mermaidPromise = import('mermaid').then(mod => {
    const m = mod.default;
    m.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'strict',
      themeVariables: {
        background: '#0f172a',
        primaryColor: '#1e293b',
        primaryTextColor: '#e2e8f0',
        primaryBorderColor: '#334155',
        lineColor: '#64748b',
        secondaryColor: '#0b1020',
        tertiaryColor: '#1e293b',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      },
    });
    return m;
  });
  return mermaidPromise;
}

interface Props {
  source: string;
}

/**
 * Post-process a Mermaid-rendered SVG element so all label text is visible.
 *
 * Mermaid applies clip-path attributes to each node group, sized exactly to
 * the shape bounding box. Any text that extends below the shape (e.g. a
 * subtitle line) is hard-clipped by those SVG <clipPath> definitions —
 * CSS overflow:visible cannot override them. We also expand the viewBox with
 * padding so text near the edges isn't cut by the SVG canvas itself.
 */
function fixSvg(svgEl: SVGSVGElement | null, forModal: boolean) {
  if (!svgEl) return;
  // Remove size attrs so viewBox + CSS govern dimensions.
  svgEl.removeAttribute('width');
  svgEl.removeAttribute('height');
  svgEl.style.overflow = 'visible';
  svgEl.style.display = 'block';
  if (forModal) {
    svgEl.style.width = '100%';
    svgEl.style.height = 'auto';
  }
  // Expand viewBox by 24px on every side so text near the boundary isn't
  // clipped by the SVG canvas edge.
  const vb = svgEl.getAttribute('viewBox');
  if (vb) {
    const parts = vb.trim().split(/[\s,]+/).map(Number);
    if (parts.length === 4 && parts.every(n => !Number.isNaN(n))) {
      const [x, y, w, h] = parts;
      const pad = 24;
      svgEl.setAttribute('viewBox', `${x - pad} ${y - pad} ${w + pad * 2} ${h + pad * 2}`);
    }
  }
  // Remove clip-path from every node group. Mermaid sizes these clip rects
  // to the shape box only, so multi-line / subtitle text that sits below
  // the shape border is clipped. Removing them lets the full label render.
  svgEl.querySelectorAll('[clip-path]').forEach(el => el.removeAttribute('clip-path'));
}

/**
 * Renders a mermaid diagram from raw mermaid syntax.
 *
 * The diagram is click-to-expand: clicking it opens a modal with a larger
 * scrollable view. ESC closes it.
 */
export function MermaidDiagram({ source }: Props) {
  const inlineRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const id = useId().replace(/[:]/g, '');
  const [error, setError] = useState<string | null>(null);
  const [svg, setSvg] = useState<string>('');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadMermaid()
      .then(m => m.render(`m-${id}`, source))
      .then(({ svg }) => {
        if (cancelled) return;
        setSvg(svg);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
      });
    return () => {
      cancelled = true;
    };
  }, [source, id]);

  // Inject the SVG once we have it.
  useEffect(() => {
    if (svg && inlineRef.current) {
      inlineRef.current.innerHTML = svg;
      fixSvg(inlineRef.current.querySelector('svg'), false);
    }
  }, [svg]);

  // The modal needs its own copy (different DOM node, different id).
  useEffect(() => {
    if (!expanded || !svg || !modalRef.current) return;
    const cleaned = svg.replace(/id="m-[^"]+"/, `id="m-${id}-modal"`);
    modalRef.current.innerHTML = cleaned;
    fixSvg(modalRef.current.querySelector('svg'), true);
  }, [expanded, svg, id]);

  // ESC to close.
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expanded]);

  if (error) {
    return (
      <pre className="bg-red-950/40 border border-red-900 text-red-200 text-xs p-3 rounded my-4 overflow-x-auto">
        Mermaid render error: {error}
      </pre>
    );
  }

  return (
    <>
      <div className="relative my-4 group">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          aria-label="Expand diagram"
          className="absolute top-2 right-2 z-10 p-1.5 rounded-md bg-ink-900/80 border border-ink-700 text-slate-300 opacity-0 group-hover:opacity-100 hover:text-accent hover:border-accent/50 transition"
        >
          <Maximize2 size={14} />
        </button>
        <div
          ref={inlineRef}
          onClick={() => setExpanded(true)}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setExpanded(true);
            }
          }}
          className="p-3 bg-ink-950 border border-ink-800 rounded-lg overflow-x-auto cursor-zoom-in [&_svg]:max-w-full [&_svg]:h-auto hover:border-ink-700 transition"
        />
      </div>

      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setExpanded(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Expanded diagram"
        >
          <button
            type="button"
            onClick={() => setExpanded(false)}
            aria-label="Close diagram"
            className="absolute top-4 right-4 p-2 rounded-md bg-ink-900 border border-ink-700 text-slate-200 hover:text-accent hover:border-accent/50 transition"
          >
            <X size={20} />
          </button>
          <div
            className="w-[95vw] max-h-[90vh] overflow-auto bg-ink-950 border border-ink-800 rounded-lg p-6 pb-10"
            onClick={e => e.stopPropagation()}
          >
            <div ref={modalRef} className="w-full" />
          </div>
        </div>
      )}
    </>
  );
}
