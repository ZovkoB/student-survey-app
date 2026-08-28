import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const CURSOR_PROJECT_ID =
  "C-Users-Korisnik-AppData-Local-Temp-68b029ae-d1c2-47c7-a6f3-c2b45bb13442";

const HERO_ASSET_FILENAMES = [
  "c__Users_Korisnik_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_examples_main-b98a0300-6dd4-4198-a4c2-7201f999c6b0.png",
  "c__Users_Korisnik_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_bgpage-6c5830e2-7d84-4fe7-996e-e5130fb4c8d0.png",
] as const;

function getCursorAssetPath(filename: string) {
  return path.join(
    os.homedir(),
    ".cursor",
    "projects",
    CURSOR_PROJECT_ID,
    "assets",
    filename,
  );
}

function getHeroImageCandidates() {
  const cwd = process.cwd();
  const publicCandidates = [
    path.join(cwd, "public", "hero-illustration.png"),
    path.join(cwd, "public", "bgpage.png"),
    path.join(cwd, "public", "bgpage.jpg"),
  ];

  const cursorCandidates = HERO_ASSET_FILENAMES.flatMap((filename) => [
    getCursorAssetPath(filename),
    path.join(cwd, "..", ".cursor", "projects", CURSOR_PROJECT_ID, "assets", filename),
  ]);

  return [...publicCandidates, ...cursorCandidates];
}

export function getHeroIllustrationSrc(): string {
  for (const candidate of getHeroImageCandidates()) {
    if (fs.existsSync(candidate)) {
      const buffer = fs.readFileSync(candidate);
      const mime = candidate.endsWith(".jpg") ? "image/jpeg" : "image/png";
      return `data:${mime};base64,${buffer.toString("base64")}`;
    }
  }

  return "";
}
