import type { ComponentGraphInput } from "vue-sentinel-x-core/browser";

/** Shape expected by vis-network (prepared for future integration). */
export type VisNetworkNode = {
  id: string;
  label: string;
  title?: string;
  color?: string;
};

export type VisNetworkEdge = {
  from: string;
  to: string;
  arrows?: string;
};

export type VisNetworkData = {
  nodes: VisNetworkNode[];
  edges: VisNetworkEdge[];
};

function shortPath(id: string): string {
  const parts = id.replace(/\\/g, "/").split("/");
  return parts[parts.length - 1] ?? id;
}

/**
 * Convert plugin graph JSON → vis-network nodes/edges.
 * Call `renderVisNetwork(container, data)` when vis-network is installed.
 */
export function toVisNetworkData(
  graph: ComponentGraphInput,
): VisNetworkData {
  const sharedIds = new Set(
    (graph.sharedComponents ?? []).map((s) => s.id),
  );

  const nodes: VisNetworkNode[] = graph.components.map((c) => ({
    id: c.id,
    label: c.name,
    title: c.id,
    color: sharedIds.has(c.id) ? "#f59e0b" : "#3b82f6",
  }));

  const edgeKeys = new Set<string>();
  const edges: VisNetworkEdge[] = [];

  for (const component of graph.components) {
    for (const childId of component.children ?? []) {
      const key = `${component.id}->${childId}`;
      if (edgeKeys.has(key)) {
        continue;
      }
      edgeKeys.add(key);
      edges.push({
        from: component.id,
        to: childId,
        arrows: "to",
      });
    }
  }

  return { nodes, edges };
}

/** Placeholder mount point — swap body when `vis-network` is added. */
export type GraphRenderer = (
  container: HTMLElement,
  data: VisNetworkData,
) => () => void;

export const graphRendererPlaceholder: GraphRenderer = (container, data) => {
  container.dataset.graphNodes = String(data.nodes.length);
  container.dataset.graphEdges = String(data.edges.length);
  return () => undefined;
};

export { shortPath };
