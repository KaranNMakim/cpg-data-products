# CPG.ai Data Products Tool

A React + Express + SQLite catalog for CPG data products — browse value chains, KPIs, source tables, ER diagrams, and ADF/ADLS deep links.

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/KaranNMakim/cpg-data-products?quickstart=1)

---

## Run It

### Option 1 — GitHub Codespaces (Cloud, zero setup)

Click the **Open in GitHub Codespaces** badge above. A cloud dev environment opens in your browser with everything pre-installed:
- Node.js 22 ready
- Dependencies auto-installed
- SQLite database auto-seeded
- Ports 5000 (API) and 5173 (Web App) auto-forwarded

Once the Codespace is ready, run:

```bash
npm start
```

Click the **"Web App (Vite)"** entry in the **Ports** panel — it opens the running app in a new browser tab.

### Option 2 — Local (one command)

From this folder:

```bash
npm start
```

This single command:
1. Auto-creates the SQLite database on first run (skips on subsequent runs)
2. Starts the **API** on http://localhost:5000
3. Starts the **frontend** on http://localhost:5173
4. Streams both server logs in one terminal with `[API]` / `[WEB]` prefixes
5. Stops both with one `Ctrl+C`

### Option B — Double-click launcher

| OS | File |
|---|---|
| Windows | Double-click **`launch.cmd`** |
| macOS / Linux | Run **`./launch.sh`** (run `chmod +x launch.sh` once if needed) |

The launcher checks for Node.js, installs dependencies on first run, then runs `npm start`.

### Open the app

Once you see `VITE ready`, open: **http://localhost:5173**

To stop: press `Ctrl+C` in the terminal.

---

## First-Time Setup

If this is a fresh clone:

```bash
npm install --legacy-peer-deps
npm start
```

The `start` script auto-runs `db/init.js` which creates and seeds `db/app.db` from the JSON source files in `src/data/`.

---

## Available Commands

| Command | What it does |
|---|---|
| `npm start` | Init DB (if needed) + run API + frontend together |
| `npm run dev` | Run frontend only (Vite, port 5173) |
| `npm run server` | Run API only (Express, port 5000) |
| `npm run db:init` | Create DB if missing (idempotent — safe to run anytime) |
| `npm run db:reset` | **Wipe** and re-seed `db/app.db` from JSON files |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

---

## Project Structure

```
Data App/
├── db/
│   ├── setup.js       # Schema + seed (destructive — wipes DB)
│   ├── init.js        # Idempotent — only creates DB if missing
│   ├── index.js       # CRUD module used by server.js
│   └── app.db         # SQLite file (gitignored, auto-generated)
├── src/
│   ├── api.js         # Centralized frontend API client
│   ├── pages/         # Route components
│   ├── components/
│   └── data/          # Source-of-truth seed JSON
├── server.js          # Express API on port 5000
├── launch.cmd         # Windows double-click launcher
├── launch.sh          # macOS/Linux launcher
└── docs/              # FRD, TRD, Roadmap
```

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| "Port 5000 already in use" | Kill the old node process: `taskkill /F /IM node.exe` (Windows) or `pkill node` (mac/linux) |
| "better-sqlite3 native binding error" | Rebuild: `npm rebuild better-sqlite3` |
| Empty registry, no data showing | Run `npm run db:reset` to re-seed |
| Vite says "port 5173 in use, trying 5174" | The proxy handles either port; just open the URL it prints |

---

## Architecture

See `docs/Technical-Requirements.md` for the full architecture diagram, schema, API spec, and Azure integration details.

For functional features and the product roadmap (including upcoming v1.1 Agentic Backend), see `docs/Functional-Requirements.md` and `docs/Roadmap.md`.
