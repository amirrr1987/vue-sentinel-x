import type { IntelligenceContext, RuleFinding } from "../types.js";
import type { SentinelRule } from "./types.js";

const SHARED_USAGE_THRESHOLD = 4;
const CASCADE_UPDATE_COUNT = 40;

export const unnecessaryReactivityRules: SentinelRule[] = [
  {
    id: "shared-component-cascade",
    name: "Shared component cascade",
    description: "Heavily shared components can trigger broad re-renders",
    run(context: IntelligenceContext): RuleFinding[] {
      const shared = context.componentGraph?.sharedComponents ?? [];

      return shared
        .filter((s) => s.usageCount >= SHARED_USAGE_THRESHOLD)
        .map((s) => ({
          ruleId: "shared-component-cascade",
          severity: "info" as const,
          component: s.name,
          filePath: s.id,
          problem: `「${s.name}」 is used in ${s.usageCount} places. A reactive change inside it may fan out to many parents.`,
          suggestion:
            "Keep shared UI mostly presentational (props in, events out). Move volatile state to a store with selectors, or split into smaller leaf components.",
          explanation:
            "When a shared child holds reactive state, an update can mark many parent trees dirty. Prefer lifting mutable state up only where needed.",
        }));
    },
  },
  {
    id: "frequent-rerender",
    name: "Frequent re-renders",
    description: "High update count with low mount time — likely unnecessary reactivity",
    run(context: IntelligenceContext): RuleFinding[] {
      const records = context.performance?.records ?? [];

      return records
        .filter(
          (r) =>
            r.updates.count >= CASCADE_UPDATE_COUNT &&
            (r.mountDurationMs ?? 0) < 100,
        )
        .map((r) => ({
          ruleId: "frequent-rerender",
          severity: "warning" as const,
          component: r.name,
          filePath: r.componentId,
          problem: `「${r.name}」 updates very often (${r.updates.count} times) even though initial mount was fast.`,
          suggestion:
            "Use `computed` for derived data instead of mutating state in watchers. Wrap expensive lists with `v-memo` or virtual scrolling. Check v-bind object literals recreated each render.",
          explanation:
            "Fast mount but endless updates usually means reactive dependencies are wider than you think — for example inline objects in templates or watching entire stores.",
        }));
    },
  },
  {
    id: "inline-reactive-smell",
    name: "Inline reactive patterns",
    description: "Graph hint: many child imports + script setup may hide broad reactive trees",
    run(context: IntelligenceContext): RuleFinding[] {
      const components = context.componentGraph?.components ?? [];

      return components
        .filter((c) => {
          const imports = c.importedComponents?.length ?? 0;
          const children = c.children?.length ?? 0;
          return c.structure?.scriptSetup && imports >= 6 && children >= 5;
        })
        .map((c) => ({
          ruleId: "inline-reactive-smell",
          severity: "info" as const,
          component: c.name,
          filePath: c.id,
          problem: `「${c.name}」 composes many children in script setup with a minimal template — easy to accumulate reactive state in one place.`,
          suggestion:
            "Extract sections into child components so each has its own smaller reactive scope. Pass plain props instead of whole store objects when possible.",
          explanation:
            "One large setup block often holds many `ref`s and `computed`s. Any change can invalidate a big subtree. Smaller components localize updates.",
        }));
    },
  },
  {
    id: "long-task-reactivity",
    name: "Long tasks during updates",
    description: "Browser long tasks correlated with components",
    run(context: IntelligenceContext): RuleFinding[] {
      const longTasks = context.performance?.longTasks ?? [];
      const byComponent = new Map<string, number>();

      for (const task of longTasks) {
        const key = task.componentName ?? task.componentId ?? "unknown";
        byComponent.set(key, (byComponent.get(key) ?? 0) + 1);
      }

      return [...byComponent.entries()]
        .filter(([, count]) => count >= 2)
        .map(([name, count]) => ({
          ruleId: "long-task-reactivity",
          severity: "warning" as const,
          component: name === "unknown" ? undefined : name,
          problem: `The main thread was blocked ${count} times (long tasks) while 「${name}」 was active.`,
          suggestion:
            "Split heavy synchronous work across `requestAnimationFrame` chunks or move it off-thread. Reduce reactive work in hot paths.",
          explanation:
            "Long tasks (> ~50 ms) freeze input and animation. They often come from big reactive updates, JSON parsing, or sorting large lists inside watchers or render paths.",
        }));
    },
  },
];
