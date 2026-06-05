/**
 * Verifies publishable packages are built and ready for npm.
 * Run: node scripts/prepare-publish.mjs
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const packages = [
  "packages/core",
  "packages/runtime",
  "packages/vite-plugin",
];

let failed = false;

for (const pkgDir of packages) {
  const pkgPath = join(root, pkgDir, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  const distIndex = join(root, pkgDir, "dist", "index.js");

  if (pkg.private) {
    console.log(`⏭  ${pkg.name} (private — skip)`);
    continue;
  }

  if (pkg.dependencies?.["@vue-sentinel-x/core"] === "workspace:*") {
    console.warn(
      `⚠  ${pkg.name}: dependency still uses workspace:* — fix before publish`,
    );
    failed = true;
  }

  if (!existsSync(distIndex)) {
    console.error(`✖  ${pkg.name}: missing dist/index.js — run: bun run build`);
    failed = true;
  } else {
    console.log(`✓  ${pkg.name}@${pkg.version}`);
  }
}

const coreBrowser = join(root, "packages/core", "dist", "browser.js");
if (!existsSync(coreBrowser)) {
  console.error(
    "✖  @vue-sentinel-x/core: missing dist/browser.js — run: bun run build",
  );
  failed = true;
}

if (failed) {
  process.exit(1);
}

console.log("\nReady to publish (core → runtime → vite-plugin).");
