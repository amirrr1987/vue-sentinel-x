import type { AnalysisStore } from "../cache/analysis-store.js";
import { scanVueFiles } from "./scan-vue-files.js";

/**
 * Scan the project once and analyze only files not already cached.
 */
export async function syncProjectGraph(
  store: AnalysisStore,
  projectRoot: string,
): Promise<number> {
  const files = await scanVueFiles(projectRoot);
  let analyzed = 0;

  for (const filePath of files) {
    const updated = await store.analyzeFromDisk(filePath);
    if (updated) {
      analyzed += 1;
    }
  }

  return analyzed;
}
