import { basename, extname } from "node:path";
import type { ComponentEdge, SharedComponent } from "../types.js";

/**
 * Components referenced as children by two or more parents.
 */
export function computeSharedComponents(
  edges: ComponentEdge[],
  nameById: Map<string, string>,
): SharedComponent[] {
  const parentsByChild = new Map<string, Set<string>>();

  for (const edge of edges) {
    if (!edge.to.endsWith(".vue")) {
      continue;
    }
    const parents = parentsByChild.get(edge.to) ?? new Set<string>();
    parents.add(edge.from);
    parentsByChild.set(edge.to, parents);
  }

  const shared: SharedComponent[] = [];

  for (const [id, parents] of parentsByChild) {
    if (parents.size < 2) {
      continue;
    }
    const usedBy = [...parents].sort();
    shared.push({
      id,
      name: nameById.get(id) ?? componentNameFromPath(id),
      usedBy,
      usageCount: usedBy.length,
    });
  }

  return shared.sort((a, b) => b.usageCount - a.usageCount || a.id.localeCompare(b.id));
}

function componentNameFromPath(filePath: string): string {
  const file = basename(filePath, extname(filePath));
  return file
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}
