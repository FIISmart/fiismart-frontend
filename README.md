# FIISmart — Frontend

Vite + React 19 + TypeScript frontend for the FIISmart course-builder.

## Dev
```bash
npm install
npm run dev      # http://localhost:3000 — proxies /api/* to http://localhost:8080
```

## Build
```bash
npm run build    # tsc + vite build → dist/
npm run preview  # serve the production build locally
```

## Env
Copy `.env.example` to `.env.local` if you want to override the defaults.
- `VITE_API_URL` — base for fetch() calls in `lib/api.ts` (default: `/api`, proxied to backend)
- `VITE_API_ORIGIN` — backend origin used by the dev proxy (default: `http://localhost:8080`)

## Layout
- `src/` — Vite entry (`main.tsx`, `App.tsx`, `index.css`, pages)
- `lib/`, `components/`, `hooks/` — shared code, importable as `@/lib/...`, `@/components/...`, `@/hooks/...`
- `public/` — static assets served at `/`
