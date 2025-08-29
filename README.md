# where2ride

A small web app scaffolded with **Vite + TypeScript** and styled with **Tailwind CSS**.

Goal: explore and iterate on ideas for "where to ride" — a lightweight frontend you can extend with map/route/POI logic later.

> If you’re cloning this for the first time: it’s a standard Vite project. Install deps, run the dev server, and you’re good.

---

## Quick start

```bash
# 1) Clone
git clone https://github.com/velotist/where2ride.git
cd where2ride

# 2) Install deps (npm shown; yarn/pnpm also fine)
npm install

# 3) Start dev server
npm run dev
# → open the shown localhost URL

# 4) Build for production
npm run build

# 5) Preview the production build locally
npm run preview
```

* `npm run dev` starts Vite’s dev server with hot reload.
* `npm run build` outputs a static production bundle to `dist/`.
* `npm run preview` serves the built files locally so you can sanity-check the production build.

> Based on how Vite works: dev = fast HMR server, build = optimized static bundle, preview = local static server.

---

## Requirements

* Node.js 18+ (Node 20+ recommended)
* A package manager (npm, pnpm, or yarn)
* Modern browser (Chromium, Firefox, Safari)

---

## What’s in here

The repo uses a typical Vite + TS + Tailwind layout:

```text
.
├─ public/                  # static assets copied as-is
├─ src/                     # your application code (TS/JS/CSS/assets)
├─ index.html               # Vite entry HTML
├─ vite.config.ts           # Vite configuration
├─ tailwind.config.cjs      # Tailwind config
├─ postcss.config.cjs       # PostCSS config for Tailwind
├─ tsconfig.json            # TypeScript config
├─ package.json             # scripts & dependencies
└─ ...
```

You can see these files in the repo root.

---

## Tech choices

* **Vite**: fast dev server + Rollup-based production builds.
* **TypeScript**: safer, clearer code.
* **Tailwind CSS**: utility-first styling with an efficient workflow.

Tailwind is wired through PostCSS and included via your entry CSS (or `index.html`) per the official Vite + Tailwind setup.

---

## How to work on features

1. Add or change UI in `src/` (components, pages, utilities).
2. Use Tailwind classes directly in your markup for styling.
3. Keep `index.html` minimal; let Vite handle module loading.
4. When you need environment variables, follow Vite’s `import.meta.env` pattern and put values in `.env` files (not committed).

---

## Scripts (package.json)

Common scripts you’ll find/use:

* `dev` — start the dev server
* `build` — build the production bundle to `dist/`
* `preview` — serve the built bundle locally

> These are the standard Vite scripts; exact names live in `package.json`.

---

## Development tips

* **HMR**: changes in `src/` hot-reload instantly.
* **Static assets**: put files in `public/` to serve them as-is at the site root.
* **Absolute imports**: if you prefer, configure path aliases in `vite.config.ts` and `tsconfig.json`.
* **Type safety**: enable `strict` in `tsconfig.json` for tighter checks.

---

## Testing & linting (optional)

If you add **Vitest**, **ESLint**, or **Prettier**, typical commands are:

```bash
npm run test
npm run lint
npm run format
```

Add the corresponding dev dependencies and configs as needed.

---

## Build & deploy

`npm run build` creates a static site in `dist/`. You can deploy it to any static host (GitHub Pages, Netlify, Vercel, S3, etc.).
Use `npm run preview` to verify the production bundle locally before pushing.

---

## Accessibility & performance

* Favor semantic HTML.
* Ensure color contrast meets WCAG 2.1 AA.
* Test keyboard navigation and focus styles.
* Keep bundles small; only add libraries you need.
* Audit with Lighthouse/axe.

---

## Roadmap ideas (nice to have)

* Map view (OpenStreetMap/Leaflet or MapLibre)
* Route filters (distance, surface, elevation)
* Weather and wind overlays
* Offline cache for planned rides
* Shareable route links

> These are suggestions for the “where to ride” concept; adjust as you implement.

---

## Contributing

1. Create a feature branch from `develop`.
2. Commit with clear messages.
3. Open a Pull Request describing the change and its rationale.

---

## License

MIT License — see [LICENSE](https://github.com/velotist/where2ride/blob/develop/LICENSE) for details.

---

## References

* [Vite docs](https://vite.dev/guide/): Getting started / build / preview.
* [Tailwind CSS with Vite](https://tailwindcss.com/docs): official steps.
