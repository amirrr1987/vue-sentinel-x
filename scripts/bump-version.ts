/**
 * Usage:
 *   bun run scripts/bump-version.ts patch   # 0.1.0 → 0.1.1
 *   bun run scripts/bump-version.ts minor   # 0.1.0 → 0.2.0
 *   bun run scripts/bump-version.ts major   # 0.1.0 → 1.0.0
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;

const PUBLISHABLE = [
  "packages/core",
  "packages/runtime",
  "packages/vite-plugin",
];

type BumpType = "patch" | "minor" | "major";

function bump(version: string, type: BumpType): string {
  const [major, minor, patch] = version.split(".").map(Number);
  if (type === "major") return `${major + 1}.0.0`;
  if (type === "minor") return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

function readPkg(dir: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(ROOT, dir, "package.json"), "utf8")) as Record<string, unknown>;
}

function writePkg(dir: string, pkg: Record<string, unknown>): void {
  writeFileSync(
    join(ROOT, dir, "package.json"),
    JSON.stringify(pkg, null, 2) + "\n",
  );
}

const type = (process.argv[2] ?? "patch") as BumpType;
if (!["patch", "minor", "major"].includes(type)) {
  console.error(`Unknown bump type: ${type}. Use patch | minor | major`);
  process.exit(1);
}

// Get current version from core (source of truth)
const core = readPkg("packages/core");
const current = core.version as string;
const next = bump(current, type);

console.log(`\nBumping ${type}: ${current} → ${next}\n`);

for (const dir of PUBLISHABLE) {
  const pkg = readPkg(dir);
  const old = pkg.version;
  pkg.version = next;

  // Update internal workspace deps to exact new version
  for (const depField of ["dependencies", "devDependencies", "peerDependencies"] as const) {
    const deps = pkg[depField] as Record<string, string> | undefined;
    if (!deps) continue;
    for (const [name, ver] of Object.entries(deps)) {
      if (name.startsWith("@vue-sentinel-x/") && ver.startsWith("^")) {
        deps[name] = `^${next}`;
      }
    }
  }

  writePkg(dir, pkg);
  console.log(`  ✓ ${pkg.name}  ${old} → ${next}`);
}

console.log(`\nDone. Commit with:\n  git commit -am "chore: release v${next}"\n  git tag v${next}\n`);
