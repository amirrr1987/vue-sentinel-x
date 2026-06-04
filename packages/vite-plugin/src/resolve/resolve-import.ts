import { dirname, isAbsolute, normalize, resolve } from "node:path";
import { normalizeModuleId } from "../utils.js";

export type ResolveComponentPath = (
  specifier: string,
  importerPath: string,
) => Promise<string | null>;

export type ViteResolveContext = {
  resolve: (
    source: string,
    importer: string | undefined,
    options?: { skipSelf?: boolean },
  ) => Promise<{ id: string } | null | undefined>;
};

/** Resolve a relative `.vue` import from the importer's directory (sync, no aliases). */
export function resolveRelativeVueImport(
  specifier: string,
  importerPath: string,
): string | null {
  if (!specifier.endsWith(".vue")) {
    return null;
  }
  if (!specifier.startsWith(".") && !isAbsolute(specifier)) {
    return null;
  }
  const importerDir = dirname(importerPath);
  return normalize(resolve(importerDir, specifier));
}

export function createViteResolver(
  context: ViteResolveContext,
): ResolveComponentPath {
  return async (specifier, importerPath) => {
    const relative = resolveRelativeVueImport(specifier, importerPath);
    if (relative) {
      return relative;
    }

    try {
      const result = await context.resolve(specifier, importerPath, {
        skipSelf: true,
      });
      if (!result) {
        return null;
      }
      const id = normalizeModuleId(result.id);
      return id.endsWith(".vue") ? id : null;
    } catch {
      return null;
    }
  };
}
