/**
 * Usage:
 *   npm run version:patch   # 0.1.0 → 0.1.1
 *   npm run version:minor   # 0.1.0 → 0.2.0
 *   npm run version:major   # 0.1.0 → 1.0.0
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;

const INTERNAL = [
  "packages/core",
  "packages/runtime",
  "packages/vite-plugin",
  "packages/vue-sentinel-x",
];

type BumpType = "patch" | "minor" | "major";

function bump(version: string, type: BumpType): string {
  const [major, minor, patch] = version.split(".").map(Number);
  if (type === "major") return `${major + 1}.0.0`;
  if (type === "minor") return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

function readPkg(relativePath: string): Record<string, unknown> {
  const file = relativePath ? join(ROOT, relativePath, "package.json") : join(ROOT, "package.json");
  return JSON.parse(readFileSync(file, "utf8")) as Record<string, unknown>;
}

function writePkg(relativePath: string, pkg: Record<string, unknown>): void {
  const file = relativePath ? join(ROOT, relativePath, "package.json") : join(ROOT, "package.json");
  writeFileSync(file, JSON.stringify(pkg, null, 2) + "\n");
}

function syncInternalDeps(pkg: Record<string, unknown>, next: string): void {
  for (const depField of ["dependencies", "devDependencies", "peerDependencies"] as const) {
    const deps = pkg[depField] as Record<string, string> | undefined;
    if (!deps) continue;
    for (const [name, ver] of Object.entries(deps)) {
      if (name.startsWith("vue-sentinel-x-") && ver.startsWith("^")) {
        deps[name] = `^${next}`;
      }
    }
  }
}

const type = (process.argv[2] ?? "patch") as BumpType;
if (!["patch", "minor", "major"].includes(type)) {
  console.error(`Unknown bump type: ${type}. Use patch | minor | major`);
  process.exit(1);
}

const core = readPkg("packages/core");
const current = core.version as string;
const next = bump(current, type);

console.log(`\nBumping ${type}: ${current} → ${next}\n`);

for (const dir of INTERNAL) {
  const pkg = readPkg(dir);
  const old = pkg.version;
  pkg.version = next;
  syncInternalDeps(pkg, next);
  writePkg(dir, pkg);
  console.log(`  ✓ ${pkg.name}  ${old} → ${next}`);
}

console.log(`\nDone. Commit with:\n  git commit -am "chore: release v${next}"\n  git push origin main\n`);
