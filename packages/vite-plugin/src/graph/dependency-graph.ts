import type {
  ComponentEdge,
  ComponentNode,
  DependencyGraph,
  VueFileAnalysis,
} from "../types.js";

/**
 * Accumulates per-file Vue analyses into a component dependency graph.
 */
export class DependencyGraphBuilder {
  private readonly nodes = new Map<string, ComponentNode>();
  private readonly edges: ComponentEdge[] = [];
  private readonly edgeKeys = new Set<string>();

  add(analysis: VueFileAnalysis): void {
    this.nodes.set(analysis.filePath, {
      id: analysis.filePath,
      name: analysis.componentName,
      importedComponents: analysis.importedComponents,
      structure: analysis.structure,
    });

    for (const imp of analysis.importedComponents) {
      const edge: ComponentEdge = {
        from: analysis.filePath,
        to: imp.specifier,
        via: imp.localName,
      };
      const key = `${edge.from}->${edge.to}:${edge.via ?? ""}`;
      if (this.edgeKeys.has(key)) {
        continue;
      }
      this.edgeKeys.add(key);
      this.edges.push(edge);
    }
  }

  toJSON(): DependencyGraph {
    return {
      components: [...this.nodes.values()],
      edges: [...this.edges],
    };
  }

  clear(): void {
    this.nodes.clear();
    this.edges.length = 0;
    this.edgeKeys.clear();
  }
}
