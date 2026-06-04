import { readdir } from "node:fs/promises";
import { extname, join } from "node:path";

const IGNORED_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "analysis",
  "coverage",
  ".output",
  ".nuxt",
  ".next",
]);

/**
 * Recursively collect `.vue` files under the Vite project root.
 */
export async function scanVueFiles(root: string): Promise<string[]> {
  const results: string[] = [];
  await walk(root, results);
  return results.sort();
}

async function walk(dir: string, results: string[]): Promise<void> {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) {
        await walk(fullPath, results);
      }
      continue;
    }
    if (entry.isFile() && extname(entry.name) === ".vue") {
      results.push(fullPath);
    }
  }
}
