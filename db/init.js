/**
 * Idempotent database initializer.
 * - If db/app.db doesn't exist → run full setup (schema + seed).
 * - If it exists → do nothing.
 *
 * To force a reset, delete db/app.db (or run `npm run db:reset`) and re-run.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "app.db");
const SETUP_SCRIPT = path.join(__dirname, "setup.js");

if (fs.existsSync(DB_PATH)) {
  console.log("[db:init] Database already exists — skipping seed.");
  console.log(`[db:init] Path: ${DB_PATH}`);
  console.log("[db:init] To reset, run: npm run db:reset");
  process.exit(0);
}

console.log("[db:init] No database found — running first-time setup...");
const result = spawnSync("node", [SETUP_SCRIPT], {
  stdio: "inherit",
  shell: false,
});

if (result.status !== 0) {
  console.error("[db:init] Setup failed.");
  process.exit(result.status || 1);
}

console.log("[db:init] Database ready.");
