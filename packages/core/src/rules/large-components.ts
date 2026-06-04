import type { IntelligenceContext, RuleFinding } from "../types.js";
import type { SentinelRule } from "./types.js";

const MANY_CHILDREN = 8;
const MANY_IMPORTS = 10;
const SLOW_MOUNT_MS = 50;
const LARGE_SCORE_CHILDREN = 12;

function basename(path: string): string {
  const parts = path.replace(/\\/g, "/").split("/");
  return parts[parts.length - 1] ?? path;
}

export const largeComponentRules: SentinelRule[] = [
  {
    id: "large-component-children",
    name: "Too many child components",
    description: "Flags components that compose many direct children",
    run(context: IntelligenceContext): RuleFinding[] {
      const components = context.componentGraph?.components ?? [];

      return components
        .filter((c) => (c.children?.length ?? 0) >= MANY_CHILDREN)
        .map((c) => {
          const count = c.children?.length ?? 0;
          return {
            ruleId: "large-component-children",
            severity: "warning" as const,
            component: c.name,
            filePath: c.id,
            problem: `「${c.name}」 (${basename(c.id)}) directly uses ${count} child components — it is doing a lot in one file.`,
            suggestion:
              "Split into layout sections (header, sidebar, content) as separate `.vue` files. Each file should have one clear job.",
            explanation:
              "Large components are harder to test, slower to re-render, and tougher for teammates to read. Vue works best with small, focused trees.",
          };
        });
    },
  },
  {
    id: "large-component-imports",
    name: "Too many imports",
    description: "Many .vue imports often means a god component",
    run(context: IntelligenceContext): RuleFinding[] {
      const components = context.componentGraph?.components ?? [];

      return components
        .filter((c) => (c.importedComponents?.length ?? 0) >= MANY_IMPORTS)
        .map((c) => {
          const count = c.importedComponents?.length ?? 0;
          return {
            ruleId: "large-component-imports",
            severity: "warning" as const,
            component: c.name,
            filePath: c.id,
            problem: `「${c.name}」 imports ${count} other Vue components in one script.`,
            suggestion:
              "Group related UI into a parent section component (e.g. `DashboardPanel.vue`) and import that once. Keep the page component as a thin orchestrator.",
            explanation:
              "A long import list is a smell that one file orchestrates too much UI. Refactors get riskier and hot reload slows down.",
          };
        });
    },
  },
  {
    id: "large-component-slow-mount",
    name: "Slow mounting component",
    description: "Slow first mount often correlates with large templates or heavy setup",
    run(context: IntelligenceContext): RuleFinding[] {
      const records = context.performance?.records ?? [];

      return records
        .filter((r) => (r.mountDurationMs ?? 0) >= SLOW_MOUNT_MS)
        .map((r) => ({
          ruleId: "large-component-slow-mount",
          severity: "warning" as const,
          component: r.name,
          filePath: r.componentId,
          problem: `「${r.name}」 took ${(r.mountDurationMs ?? 0).toFixed(1)} ms to mount — users may feel a delay when this screen opens.`,
          suggestion:
            "Lazy-load heavy children with `defineAsyncComponent`. Defer non-critical data fetching until after mount. Trim the initial template.",
          explanation:
            "Mount time includes running setup, rendering, and patching the DOM. Big components or synchronous API work in `setup` inflate this number.",
        }));
    },
  },
  {
    id: "large-component-combined",
    name: "Oversized component",
    description: "Combines graph size signals into one clear recommendation",
    run(context: IntelligenceContext): RuleFinding[] {
      const components = context.componentGraph?.components ?? [];
      const perfById = new Map(
        (context.performance?.records ?? []).map((r) => [r.componentId, r]),
      );

      return components
        .filter((c) => {
          const children = c.children?.length ?? 0;
          const imports = c.importedComponents?.length ?? 0;
          const score = children + imports;
          const slow = (perfById.get(c.id)?.mountDurationMs ?? 0) >= SLOW_MOUNT_MS;
          return score >= LARGE_SCORE_CHILDREN || (children >= 6 && imports >= 6 && slow);
        })
        .map((c) => {
          const children = c.children?.length ?? 0;
          const imports = c.importedComponents?.length ?? 0;
          return {
            ruleId: "large-component-combined",
            severity: "error" as const,
            component: c.name,
            filePath: c.id,
            problem: `「${c.name}」 is a large component (${children} children, ${imports} imports) and is a good candidate to split up.`,
            suggestion:
              "Draw boxes around UI regions in Figma or on paper — each box becomes a child component. Move business logic into composables (`useUser.ts`).",
            explanation:
              "Large components increase bundle parse cost, re-render scope, and bug surface. Splitting improves performance and makes the Intelligence Engine’s other checks more precise.",
          };
        });
    },
  },
];
