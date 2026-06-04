import { readFile } from "node:fs/promises";
import { analyzeVueFile } from "../analysis/analyze-vue-file.js";
import { DependencyGraphBuilder } from "../graph/dependency-graph.js";
import type { ComponentGraphFile, VueFileAnalysis } from "../types.js";
import type { ResolveComponentPath } from "../resolve/resolve-import.js";
import { hashContent } from "./content-hash.js";

type CacheEntry = {
  hash: string;
  analysis: VueFileAnalysis;
};

/**
 * Per-file content cache + project graph. Only re-parses when source hash changes.
 */
export class AnalysisStore {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly graph = new DependencyGraphBuilder();
  get componentCount(): number {
    return this.graph.size;
  }

  /**
   * Analyze source from Vite transform (preferred — matches bundled content).
   * Returns true when the file was parsed or updated.
   */
  analyzeIfChanged(filePath: string, source: string): boolean {
    const hash = hashContent(source);
    const cached = this.cache.get(filePath);
    if (cached?.hash === hash) {
      return false;
    }

    const analysis = analyzeVueFile(source, filePath);
    if (!analysis) {
      return false;
    }

    this.cache.set(filePath, { hash, analysis });
    this.graph.set(analysis);
    return true;
  }

  /** Read from disk for initial project scan (skipped when cache is fresh). */
  async analyzeFromDisk(filePath: string): Promise<boolean> {
    let source: string;
    try {
      source = await readFile(filePath, "utf8");
    } catch {
      return false;
    }
    return this.analyzeIfChanged(filePath, source);
  }

  invalidate(filePath: string): void {
    this.cache.delete(filePath);
  }

  remove(filePath: string): void {
    this.cache.delete(filePath);
    this.graph.remove(filePath);
  }

  async buildGraph(
    projectRoot: string,
    resolvePath?: ResolveComponentPath,
  ): Promise<ComponentGraphFile> {
    return this.graph.build(projectRoot, resolvePath);
  }

  clear(): void {
    this.cache.clear();
    this.graph.clear();
  }
}
