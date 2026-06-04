import { basename, extname } from "node:path";
import type { ImportedComponentRef, VueFileAnalysis } from "../types.js";
import { parseVueSfc } from "./parse-sfc.js";
import { analyzeScriptAst } from "./parse-script-ast.js";

/**
 * Full analysis pipeline for a single `.vue` source string.
 */
export function analyzeVueFile(
  source: string,
  filePath: string,
): VueFileAnalysis | null {
  const parsed = parseVueSfc(source, filePath);
  if (!parsed) {
    return null;
  }

  const { structure, scriptSources } = parsed;
  let componentName: string | undefined;
  const importedBySpecifier = new Map<string, ImportedComponentRef>();

  for (const scriptContent of scriptSources) {
    const scriptResult = analyzeScriptAst(scriptContent, filePath);
    if (scriptResult.componentName) {
      componentName = scriptResult.componentName;
    }
    for (const ref of scriptResult.importedComponents) {
      const key = `${ref.specifier}:${ref.localName}`;
      if (!importedBySpecifier.has(key)) {
        importedBySpecifier.set(key, ref);
      }
    }
  }

  return {
    filePath,
    componentName: componentName ?? componentNameFromPath(filePath),
    importedComponents: [...importedBySpecifier.values()],
    structure,
  };
}

function componentNameFromPath(filePath: string): string {
  const file = basename(filePath, extname(filePath));
  return file
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}
