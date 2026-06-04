import type { ResolveComponentPath } from "../resolve/resolve-import.js";
import { resolveRelativeVueImport } from "../resolve/resolve-import.js";
import type {
  ComponentEdge,
  ComponentGraphFile,
  ComponentNode,
  DependencyGraph,
  VueFileAnalysis,
} from "../types.js";
import { computeSharedComponents } from "./compute-shared.js";

type AnalysisEntry = VueFileAnalysis;

/**
 * Project-wide graph built from cached per-file analyses.
 * Recomputes edges from the full analysis map (cheap vs re-parsing).
 */
export class DependencyGraphBuilder {
  private readonly analyses = new Map<string, AnalysisEntry>();

  set(analysis: VueFileAnalysis): void {
    this.analyses.set(analysis.filePath, analysis);
  }

  remove(filePath: string): void {
    this.analyses.delete(filePath);
  }

  has(filePath: string): boolean {
    return this.analyses.has(filePath);
  }

  get size(): number {
    return this.analyses.size;
  }

  async build(
    projectRoot: string,
    resolvePath?: ResolveComponentPath,
  ): Promise<ComponentGraphFile> {
    const resolveCache = new Map<string, string | null>();
    const edges: ComponentEdge[] = [];
    const edgeKeys = new Set<string>();
    const childrenByParent = new Map<string, Set<string>>();
    const parentsByChild = new Map<string, Set<string>>();
    const nameById = new Map<string, string>();

    const resolveTarget = async (
      specifier: string,
      importerPath: string,
    ): Promise<string | null> => {
      const cacheKey = `${importerPath}::${specifier}`;
      if (resolveCache.has(cacheKey)) {
        return resolveCache.get(cacheKey) ?? null;
      }

      const relative = resolveRelativeVueImport(specifier, importerPath);
      let resolved = relative;
      if (!resolved && resolvePath) {
        resolved = await resolvePath(specifier, importerPath);
      }

      resolveCache.set(cacheKey, resolved);
      return resolved;
    };

    for (const analysis of this.analyses.values()) {
      nameById.set(analysis.filePath, analysis.componentName);

      for (const imp of analysis.importedComponents) {
        const childPath = await resolveTarget(imp.specifier, analysis.filePath);
        if (!childPath) {
          continue;
        }

        imp.resolvedPath = childPath;

        const edge: ComponentEdge = {
          from: analysis.filePath,
          to: childPath,
          via: imp.localName,
        };
        const key = `${edge.from}->${edge.to}:${edge.via ?? ""}`;
        if (!edgeKeys.has(key)) {
          edgeKeys.add(key);
          edges.push(edge);
        }

        const children = childrenByParent.get(analysis.filePath) ?? new Set();
        children.add(childPath);
        childrenByParent.set(analysis.filePath, children);

        const parents = parentsByChild.get(childPath) ?? new Set();
        parents.add(analysis.filePath);
        parentsByChild.set(childPath, parents);
      }
    }

    const components: ComponentNode[] = [...this.analyses.values()]
      .map((analysis) => ({
        id: analysis.filePath,
        name: analysis.componentName,
        importedComponents: analysis.importedComponents,
        structure: analysis.structure,
        children: [...(childrenByParent.get(analysis.filePath) ?? [])].sort(),
        parents: [...(parentsByChild.get(analysis.filePath) ?? [])].sort(),
      }))
      .sort((a, b) => a.id.localeCompare(b.id));

    const sharedComponents = computeSharedComponents(edges, nameById);

    return {
      meta: {
        generatedAt: new Date().toISOString(),
        projectRoot,
        componentCount: components.length,
        edgeCount: edges.length,
        sharedCount: sharedComponents.length,
      },
      components,
      edges: edges.sort(
        (a, b) =>
          a.from.localeCompare(b.from) ||
          a.to.localeCompare(b.to) ||
          (a.via ?? "").localeCompare(b.via ?? ""),
      ),
      sharedComponents,
    };
  }

  toJSON(): DependencyGraph {
    const components: ComponentNode[] = [...this.analyses.values()].map(
      (analysis) => ({
        id: analysis.filePath,
        name: analysis.componentName,
        importedComponents: analysis.importedComponents,
        structure: analysis.structure,
        children: analysis.importedComponents
          .map((imp) => imp.resolvedPath)
          .filter((p): p is string => Boolean(p)),
        parents: [],
      }),
    );
    return { components, edges: [] };
  }

  clear(): void {
    this.analyses.clear();
  }
}
