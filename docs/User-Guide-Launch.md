# User Guide — Launching the App Locally

**Audience:** Anyone who wants to run the CPG.ai Data Products Tool on their own laptop.
**Time required:** ~5 minutes the first time, ~10 seconds every time after.

---

## What you'll end up with

Two services running on your machine:

| Service | URL | Purpose |
|---|---|---|
| **Web app** (frontend) | http://localhost:5173 | The page you open in your browser |
| **API** (backend) | http://localhost:5000 | Data store, hidden from you — the web app talks to it |

Both run from a single terminal window.

---

## Prerequisites (one-time)

### 1. Install Node.js

You need **Node.js version 22.x** (or newer).

| OS | How |
|---|---|
| Windows | Download `node-vXX.X.X-x64.msi` from https://nodejs.org and run it |
| macOS | Download the `.pkg` from https://nodejs.org, or `brew install node@22` |
| Linux | `curl -fsSL https://deb.nodesource.com/setup_22.x \| sudo -E bash - && sudo apt install -y nodejs` |

**Verify it's installed:**

Open a terminal (Command Prompt on Windows, Terminal on macOS) and type:

```bash
node --version
```

You should see something like `v22.15.0`. If you see an error or "command not found", restart your terminal and try again.

### 2. Get the project files

If you have the zip:
- Unzip it somewhere convenient — e.g., `C:\Users\<you>\Downloads\Data App` or `~/Documents/Data App`

If you have access to the git repo:
```bash
git clone https://github.com/KaranNMakim/Data-Products.git
```

You should now have a folder called **`Data App`** containing files like `package.json`, `server.js`, and a `src/` directory.

---

## Option A — Easiest (double-click the launcher)

This is the simplest way. The launcher checks for everything, installs what's missing, and starts the app.

### Windows

1. Open the `Data App` folder in File Explorer.
2. Double-click **`launch.cmd`**.
3. A black terminal window opens. The first time you run it, you'll see:
   ```
   [SETUP] Installing dependencies (first run only)...
   ```
   This takes 2–5 minutes the first time only. Go grab a coffee.
4. Eventually you'll see:
   ```
   [API]  SQLite API running on port 5000
   [WEB]  VITE v7.3.0  ready in 8s
   [WEB]  ➜  Local:   http://localhost:5173/
   ```
5. **Open your browser** and go to **http://localhost:5173**

### macOS / Linux

1. Open Terminal.
2. Navigate to the project folder:
   ```bash
   cd "/path/to/Data App"
   ```
3. The first time, make the launcher executable:
   ```bash
   chmod +x launch.sh
   ```
4. Run it:
   ```bash
   ./launch.sh
   ```
5. Open your browser to **http://localhost:5173**

---

## Option B — From the terminal (one command)

If you prefer the terminal:

```bash
cd "Data App"
npm install --legacy-peer-deps     # First time only — installs dependencies
npm start                          # Every time — starts both servers
```

That's it. Open **http://localhost:5173** when you see `VITE ready`.

---

## What you'll see in the terminal

Both servers share one window. Each line is prefixed:

```
[db:init] Database already exists — skipping seed.
[API]  SQLite API running on port 5000
[WEB]  VITE v7.3.0  ready in 7737 ms
[WEB]  ➜  Local:   http://localhost:5173/
```

- `[API]` lines come from the backend (Express on port 5000)
- `[WEB]` lines come from the frontend (Vite on port 5173)
- `[db:init]` is the database initializer — runs once before the servers

---

## Stopping the app

In the terminal where it's running, press **`Ctrl+C`**.

Both servers stop together. You can close the terminal window.

---

## Restarting later

Just repeat the launch step:

| Method | Command |
|---|---|
| Double-click | `launch.cmd` (Windows) or `./launch.sh` (mac/linux) |
| Terminal | `npm start` from inside the `Data App` folder |

The database keeps your data between restarts. Anything you create through the app (new data products, KPIs, source tables) **persists** in `db/app.db`.

---

## Common Issues

### "node is not recognized" / "command not found: node"

Node.js isn't installed, or your terminal hasn't picked it up yet. Close and reopen the terminal. If still broken, reinstall Node.js from https://nodejs.org and check the box for "Add to PATH" during install.

### "Port 5000 already in use" or "Port 5173 already in use"

Another instance is already running, or another app is using the port.

**Windows:**
```cmd
taskkill /F /IM node.exe
```

**macOS / Linux:**
```bash
pkill node
```

Then run `npm start` again.

### The web page is blank or shows an error

1. Check the terminal — is the `[API]` line showing `SQLite API running on port 5000`?
2. If not, the backend didn't start. Stop with `Ctrl+C`, then run:
   ```bash
   npm run db:reset
   npm start
   ```

### "better-sqlite3 native binding error"

This happens after a Node.js version change. Fix:
```bash
npm rebuild better-sqlite3
```

### I want to start fresh / wipe my changes

This destroys all data you've created and re-seeds from the original JSON files:

```bash
npm run db:reset
```

Then `npm start` again.

### Vite uses port 5174 instead of 5173

That's fine — Vite picks the next available port if 5173 is busy. Use whichever URL it prints in the terminal. The app proxies API calls correctly either way.

---

## What each command does

You don't usually need these — `npm start` covers everything — but here's the reference:

| Command | What happens |
|---|---|
| `npm start` | **The main one.** Initializes DB if missing, runs API + frontend together |
| `npm run dev` | Run frontend only (Vite, port 5173). Use if API is already running elsewhere |
| `npm run server` | Run API only (Express, port 5000) |
| `npm run db:init` | Create the database if it doesn't exist (does nothing if it does) |
| `npm run db:reset` | **Destructive** — wipe `db/app.db` and re-seed from JSON |
| `npm run build` | Compile a production version into `dist/` (for deployment, not local use) |

---

## Where things live on your machine

After launching, your project folder looks like this:

```
Data App/
├── db/
│   └── app.db            ← Your data (SQLite file). Keep this safe.
├── node_modules/         ← Installed dependencies (~500MB, gitignored)
├── src/                  ← Source code
├── server.js             ← Backend entry point
├── launch.cmd            ← Windows double-click launcher
├── launch.sh             ← macOS/Linux launcher
├── package.json          ← Project manifest with scripts
└── README.md             ← Quick reference
```

You can copy/back up `db/app.db` to preserve your data.

---

## When you're done with this guide

- Open the app: **http://localhost:5173**
- Click **"+ Create Data Product"** to walk through the 3-step wizard
- Browse the registry, click any product to see its detail page
- Try the Sankey lineage view from the top nav

For feature documentation, see:
- `docs/Functional-Requirements.md` — what every page does
- `docs/Technical-Requirements.md` — architecture and API
- `docs/Roadmap.md` — what's coming next

---

## Need help?

| Issue | Where to look |
|---|---|
| Launch problems | This guide, "Common Issues" section |
| App behavior questions | `docs/Functional-Requirements.md` |
| Architecture / API questions | `docs/Technical-Requirements.md` |
| Future features | `docs/Roadmap.md` |
