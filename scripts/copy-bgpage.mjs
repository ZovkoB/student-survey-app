import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const CURSOR_PROJECT_ID =
  "C-Users-Korisnik-AppData-Local-Temp-68b029ae-d1c2-47c7-a6f3-c2b45bb13442";

const src = path.join(
  os.homedir(),
  ".cursor",
  "projects",
  CURSOR_PROJECT_ID,
  "assets",
  "c__Users_Korisnik_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_examples_main-b98a0300-6dd4-4198-a4c2-7201f999c6b0.png",
);

const dest = path.join(root, "public", "hero-illustration.png");

if (!fs.existsSync(src)) {
  console.error(`Source not found: ${src}`);
  process.exit(1);
}

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.copyFileSync(src, dest);
console.log(`Copied -> ${dest} (${fs.statSync(dest).size} bytes)`);
