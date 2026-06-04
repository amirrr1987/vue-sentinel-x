import type { IntelligenceContext, RuleFinding } from "../types.js";
import type { SentinelRule } from "./types.js";

const HIGH_UPDATE_COUNT = 80;
const SLOW_AVG_UPDATE_MS = 16;
const DEEP_WATCH_HINT_COUNT = 3;

export const badWatcherRules: SentinelRule[] = [
  {
    id: "watchers-not-stopped",
    name: "Watchers not stopped",
    description: "Manual watchers still running after unmount",
    run(context: IntelligenceContext): RuleFinding[] {
      return (context.memory?.warnings ?? [])
        .filter((w) => w.code === "watchers-remain")
        .map((w) => ({
          ruleId: "watchers-not-stopped",
          severity: "error" as const,
          component: w.name,
          filePath: w.componentId,
          problem: `「${w.name}」 uses a watcher that outlived the component.`,
          suggestion:
            "Prefer watchers created during `setup()` so Vue stops them automatically. If you create one manually, call `stop()` in `onUnmounted`.",
          explanation:
            "Watchers re-run code when data changes. A watcher that survives unmount can update state on a component that no longer exists, causing errors and memory leaks.",
        }));
    },
  },
  {
    id: "watcher-update-storm",
    name: "Watcher update storm",
    description: "Very high update count suggests watchers or deps firing too often",
    run(context: IntelligenceContext): RuleFinding[] {
      const records = context.performance?.records ?? [];
      const findings: RuleFinding[] = [];

      for (const record of records) {
        const { count, avgMs, maxMs } = record.updates;
        if (count < HIGH_UPDATE_COUNT) {
          continue;
        }
        if (avgMs < SLOW_AVG_UPDATE_MS && maxMs < SLOW_AVG_UPDATE_MS * 2) {
          findings.push({
            ruleId: "watcher-update-storm",
            severity: "warning" as const,
            component: record.name,
            filePath: record.componentId,
            problem: `「${record.name}」 re-rendered ${count} times (often a sign of watchers or reactive deps firing too often).`,
            suggestion:
              "Narrow what you `watch` (watch a single field, not the whole object). Use `watchEffect` only when needed. Consider `computed` + template instead of deep watches.",
            explanation:
              "Each update re-runs render work. Many cheap updates still waste CPU and can make typing or scrolling feel laggy. Usually a watcher is too broad or writes reactive state in a loop.",
          });
        }
      }

      return findings;
    },
  },
  {
    id: "slow-watcher-updates",
    name: "Slow reactive updates",
    description: "Updates are individually expensive — often heavy watcher callbacks",
    run(context: IntelligenceContext): RuleFinding[] {
      const records = context.performance?.records ?? [];

      return records
        .filter(
          (r) =>
            r.updates.count > 0 &&
            (r.updates.avgMs >= SLOW_AVG_UPDATE_MS ||
              r.updates.maxMs >= SLOW_AVG_UPDATE_MS * 3),
        )
        .map((r) => ({
          ruleId: "slow-watcher-updates",
          severity: "warning" as const,
          component: r.name,
          filePath: r.componentId,
          problem: `Updates in 「${r.name}」 are slow (avg ${r.updates.avgMs.toFixed(1)} ms, max ${r.updates.maxMs.toFixed(1)} ms across ${r.updates.count} updates).`,
          suggestion:
            "Move heavy work out of watchers into async jobs or Web Workers. Debounce expensive handlers. Avoid doing large array copies inside `watch`.",
          explanation:
            "Watchers run synchronously on the main thread. Slow watcher callbacks block painting and input — the same effect as a long task in the browser.",
        }));
    },
  },
  {
    id: "deep-watch-smell",
    name: "Possible deep watch",
    description: "Heuristic: many imports + high updates may mean deep watching large objects",
    run(context: IntelligenceContext): RuleFinding[] {
      const graph = context.componentGraph?.components ?? [];
      const perfById = new Map(
        (context.performance?.records ?? []).map((r) => [r.componentId, r]),
      );
      const findings: RuleFinding[] = [];

      for (const node of graph) {
        const perf = perfById.get(node.id);
        if (!perf || perf.updates.count < 30) {
          continue;
        }
        const importCount = node.importedComponents?.length ?? 0;
        if (importCount < DEEP_WATCH_HINT_COUNT) {
          continue;
        }

        findings.push({
          ruleId: "deep-watch-smell",
          severity: "info" as const,
          component: node.name,
          filePath: node.id,
          problem: `「${node.name}」 has many dependencies and frequent updates — check for \`watch(obj)\` or \`watch(() => bigState)\` without narrowing.`,
          suggestion:
            "Watch specific fields: `watch(() => user.id, ...)`. Use `shallowRef` / `shallowReactive` for large data that should not deep-track. Split into smaller child components.",
          explanation:
            "Vue’s reactivity tracks nested properties when you watch whole objects. Large objects + deep watching multiply work on every small change.",
        });
      }

      return findings;
    },
  },
];
