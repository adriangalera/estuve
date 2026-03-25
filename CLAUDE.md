# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev              # Start Vite dev server (http://localhost:5173)
npm run dev:host         # Dev server with external host access
npm run build            # Production build (outputs to dist/)
npm run preview          # Build and preview production build
```

### Testing
```bash
npm run test                   # Run all tests (unit + E2E)
npm run test:unit              # Run unit tests only (Vitest)
npm run test:unit:coverage     # Run unit tests with coverage
npm run test:ui                # Run Cypress E2E tests
npm run test:ui:browser        # Open Cypress interactive browser
npm run test:ui:ci             # CI-friendly headless E2E run
```

### Deploy & Data
```bash
npm run deploy           # Build + test + deploy to GitHub Pages
make wikiloc             # Download GPX tracks from Wikiloc
make suunto              # Download GPX tracks from Suunto
make gpx                 # Consolidate all GPX files into gpx/all/
```

## Deployment

The app is deployed to **GitHub Pages** as a static site. The `npm run deploy` command builds the project and publishes it. All features must work without a backend server — storage is entirely client-side (IndexedDB, localStorage).

## Architecture

Two pages share a common map setup but differ in purpose:
- **`/` (index.html / src/main.js):** Aggregate track visualization — uploads accumulate into a single deduplicated point cloud rendered as vector tiles
- **`/plan/` (plan.html / src/plan.js):** Route planning — each GPX track is a separate Leaflet polyline layer that can be toggled/deleted

### Core Data Flow (main page)

1. User uploads GPX files → parsed in a **Web Worker** (`src/parser/trackparser.worker.js`) via fast-xml-parser
2. Points deduplicated against a **Quadtree** (`src/quadtree.js`) using 10m spatial tolerance
3. New points inserted into quadtree → persisted to **IndexedDB** (`src/storage/quadtreeStorage.js`)
4. Map re-renders track layer as GeoJSON vector tiles (leaflet-geojson-vt) for performance

### Persistence Layers

| Layer | Storage | Contents |
|-------|---------|----------|
| Track points | IndexedDB | Serialized quadtree |
| Uploaded file names | localStorage | Set of filenames to skip re-processing |
| Custom overlay layers | localStorage | GeoJSON URLs + metadata |
| Backup format (`.bin`) | File download | Base64-encoded JSON of all three above |

### Quadtree (`src/quadtree.js`)

Custom spatial index storing points as `(lng, lat)`. Key behaviors:
- Nodes split when capacity exceeded
- `locationIsOnTree()` — checks if a point is within tolerance of any existing point (deduplication)
- `serialize()` / `QuadTreeNode.fromObject()` — full serialization for IndexedDB persistence

### Map Setup (`src/maps.js`)

Configures Leaflet with multiple tile providers (OSM, TopoMap, IGN Spain, ICGC Catalonia). Map initialization is shared between both pages.

### Sync Scripts

Browser userscripts (Tampermonkey) auto-export tracks from Wikiloc/Suunto. Local Node.js servers (`scripts/wikiloc/server.js`, `scripts/suunto/server.js`) watch the Downloads folder and move `.gpx` files into `gpx/wikiloc/` or `gpx/suunto/`, then trigger `make gpx`.

## Testing Setup

- **Unit tests:** Vitest with jsdom — in `test/unit/`, mirroring `src/` structure
- **E2E tests:** Cypress in `test/ui/` — Cypress videos only saved on failure
- Test GPX resources in `test/resources/`

## Localization

i18next with browser language detection. Translation files in `public/locales/` (currently `en-GB.json` and `es.json`).
