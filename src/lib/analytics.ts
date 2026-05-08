/**
 * Privacy-first analytics shim.
 *
 * Activates ONLY when VITE_PLAUSIBLE_DOMAIN is set at build time
 * (e.g. `VITE_PLAUSIBLE_DOMAIN=apphome.dev npm run build`).
 *
 * Plausible is cookieless, GDPR-friendly, and counts only anonymous
 * pageviews/events. No personal data leaves the browser.
 *
 * To opt out at runtime, a user can set `localStorage.plausible_ignore = 'true'`.
 */

const DOMAIN = import.meta.env.VITE_PLAUSIBLE_DOMAIN as string | undefined;
const SCRIPT_URL = 'https://plausible.io/js/script.js';

let initialised = false;

declare global {
  interface Window {
    plausible?: ((event: string, opts?: { props?: Record<string, string | number | boolean> }) => void) & {
      q?: unknown[];
    };
  }
}

export function initAnalytics(): void {
  if (initialised || !DOMAIN || typeof window === 'undefined') return;
  initialised = true;

  // Stub queue so events fired before the script loads still get sent.
  window.plausible =
    window.plausible ||
    (((...args: unknown[]) => {
      (window.plausible!.q = window.plausible!.q || []).push(args);
    }) as Window['plausible']);

  const s = document.createElement('script');
  s.defer = true;
  s.src = SCRIPT_URL;
  s.dataset.domain = DOMAIN;
  document.head.appendChild(s);
}

export function track(
  event: string,
  props?: Record<string, string | number | boolean>
): void {
  if (!DOMAIN || typeof window === 'undefined') return;
  window.plausible?.(event, props ? { props } : undefined);
}
