# Deployment Notes

Short, practical notes for shipping `apphome` to production. Update as you actually deploy.

## 1. Build

From `mini-asm/apphome/`:

```bash
npm install
npm run build
```

To deploy under a subpath such as `https://www.jidemobell.com/dev/learning`,
build with a base path:

```bash
APP_BASE_PATH=/dev/learning/ npm run build
```

The `prebuild` script runs `scripts/build-starters.mjs`, which zips every
folder under `starters/` into `public/starters/<name>.zip` before Vite bundles.
Output goes to `dist/`.

## 2. Environment variables

Vite only inlines variables prefixed with `VITE_`. Create `.env.production`
in `mini-asm/apphome/` (it's gitignored via `*.local` / standard Vite rules —
double-check before committing).

### Plausible analytics (optional)

Cookieless, GDPR-friendly. The app no-ops when this is unset, so skipping
this is fine for early deploys.

```bash
echo 'VITE_PLAUSIBLE_DOMAIN=yourdomain.tld' > .env.production
```

The value must match the domain configured in your Plausible dashboard.
On load, [src/lib/analytics.ts](../src/lib/analytics.ts) injects
`https://plausible.io/js/script.js` with `data-domain=<value>`.

Events currently emitted:

| Event                      | Props                                  |
| -------------------------- | -------------------------------------- |
| `phase_opened`             | `track`, `phase`                       |
| `task_opened`              | `track`, `phase`, `task`               |
| `solution_revealed`        | `track`, `phase`, `task`               |
| `task_marked_solved`       | `track`, `phase`, `task`               |
| `run_instructions_opened`  | `track`, `phase`                       |
| `starter_downloaded`       | `track`, `phase`, `file`               |

If you ever switch to a self-hosted Plausible, also set the script URL
override in `analytics.ts`.

## 3. Static hosting

`dist/` is a plain SPA. Anywhere that serves static files works:

- Netlify / Vercel / Cloudflare Pages
- GitHub Pages
- Any nginx / S3+CloudFront setup

Two requirements:

1. **SPA fallback** — unknown paths must return `index.html` (React Router
   uses client-side routing).
   - Netlify: add `public/_redirects` containing `/*  /index.html  200`
   - Vercel: built-in for Vite SPA preset
   - nginx: `try_files $uri /index.html;`
    - If the app is mounted at `/dev/learning`, the fallback should target that
       mount point rather than the site root.
2. **Serve `/starters/*.zip` as `application/zip`** — most static hosts
   already do this by extension. No special config usually needed.

### Example mount at `/dev/learning`

- Build with `APP_BASE_PATH=/dev/learning/ npm run build`
- Upload the built files so `index.html` lives under the `/dev/learning/`
   location on your host
- Configure rewrites so requests like `/dev/learning/track/miniasm` return the
   same `/dev/learning/index.html`

## 4. Adding more starter zips

1. Create `mini-asm/apphome/starters/<id>/` with the project layout.
2. Set `starterZip: '<id>.zip'` on the matching `Phase` in
   `src/tracks/<track>/index.ts`.
3. `npm run build` (or `npm run build:starters` to only repackage zips).

The download button auto-appears in the run-instructions panel when
`starterZip` is present.

## 5. Progress data

User progress is stored in `localStorage` under key `apphome-progress-v1`.
The Export / Import / Reset controls in the sidebar produce/consume a
schema-versioned JSON snapshot. No server-side storage exists.

## 6. What is *not* configured

- No CI workflow yet
- No analytics for self-hosted Plausible (uses public `plausible.io` script)
- No CDN-specific cache headers
- No source maps in production (Vite default; flip `build.sourcemap` in
  `vite.config.ts` if you want them)
