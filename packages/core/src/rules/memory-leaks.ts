import type { IntelligenceContext, RuleFinding } from "../types.js";
import type { SentinelRule } from "./types.js";

function basename(path: string): string {
  const parts = path.replace(/\\/g, "/").split("/");
  return parts[parts.length - 1] ?? path;
}

export const memoryLeakRules: SentinelRule[] = [
  {
    id: "memory-listeners-remain",
    name: "Listeners not removed",
    description: "Detects event listeners still active after a component unmounts",
    run(context: IntelligenceContext): RuleFinding[] {
      const warnings = context.memory?.warnings ?? [];
      return warnings
        .filter((w) => w.code === "listeners-remain")
        .map((w) => ({
          ruleId: "memory-listeners-remain",
          severity: "error" as const,
          component: w.name,
          filePath: w.componentId,
          problem: `「${w.name}」 was destroyed, but it still has event listeners attached (for example on \`window\` or \`document\`).`,
          suggestion:
            "In `onUnmounted` (or the `unmounted` hook), call `removeEventListener` with the same target, event name, and function you used in `addEventListener`.",
          explanation:
            "Listeners keep a reference to your callback (and often your component data). If you do not remove them, JavaScript cannot free that memory — a classic memory leak that grows as users navigate your app.",
        }));
    },
  },
  {
    id: "memory-timers-remain",
    name: "Timers not cleared",
    description: "Detects setInterval/setTimeout still running after unmount",
    run(context: IntelligenceContext): RuleFinding[] {
      const warnings = context.memory?.warnings ?? [];
      return warnings
        .filter((w) => w.code === "timers-remain")
        .map((w) => ({
          ruleId: "memory-timers-remain",
          severity: "error" as const,
          component: w.name,
          filePath: w.componentId,
          problem: `「${w.name}」 was destroyed, but a timer (\`setTimeout\` or \`setInterval\`) is still scheduled.`,
          suggestion:
            "Store the timer id when you create it, then call `clearTimeout(id)` or `clearInterval(id)` inside `onUnmounted`.",
          explanation:
            "Timers fire later and can still touch component state or the DOM. That keeps old components alive in memory and can cause confusing bugs long after navigation.",
        }));
    },
  },
  {
    id: "memory-watchers-remain",
    name: "Watchers not stopped",
    description: "Detects manual watchers that were not stopped on unmount",
    run(context: IntelligenceContext): RuleFinding[] {
      const warnings = context.memory?.warnings ?? [];
      return warnings
        .filter((w) => w.code === "watchers-remain")
        .map((w) => ({
          ruleId: "memory-watchers-remain",
          severity: "error" as const,
          component: w.name,
          filePath: w.componentId,
          problem: `「${w.name}」 was destroyed, but at least one \`watch\` or \`watchEffect\` is still running.`,
          suggestion:
            "Call the `stop` function returned by `watch()` / `watchEffect()` in `onUnmounted`, or create watchers inside the component so Vue stops them automatically.",
          explanation:
            "A running watcher keeps observing reactive data. If it still references your component, the whole instance can stay in memory even when it is no longer on screen.",
        }));
    },
  },
  {
    id: "memory-heap-growth",
    name: "Large heap growth",
    description: "Flags unusual JS heap growth during a component lifetime",
    run(context: IntelligenceContext): RuleFinding[] {
      const warnings = context.memory?.warnings ?? [];
      return warnings
        .filter((w) => w.code === "heap-growth")
        .map((w) => {
          const mb = w.heapDeltaBytes
            ? Math.round(w.heapDeltaBytes / 1024 / 1024)
            : 0;
          return {
            ruleId: "memory-heap-growth",
            severity: "warning" as const,
            component: w.name,
            filePath: w.componentId,
            problem: `While 「${w.name}」 was mounted, browser memory grew by about ${mb} MB.`,
            suggestion:
              "Check for large arrays, cached API responses, or global stores that grow on every visit. Profile with DevTools → Memory after reproducing the flow.",
            explanation:
              "Not every heap increase is a leak, but a steady climb while opening and closing the same screen often means something is not being released. Chromium exposes this via `performance.memory`.",
          };
        });
    },
  },
  {
    id: "memory-leak-detected",
    name: "Possible memory leak",
    description: "Summarizes cleanup issues per component in one beginner-friendly message",
    run(context: IntelligenceContext): RuleFinding[] {
      const warnings = context.memory?.warnings ?? [];
      const leakCodes = new Set([
        "listeners-remain",
        "timers-remain",
        "watchers-remain",
      ]);
      const byComponent = new Map<
        string,
        { name: string; codes: Set<string> }
      >();

      for (const w of warnings) {
        if (!leakCodes.has(w.code)) {
          continue;
        }
        const entry = byComponent.get(w.componentId) ?? {
          name: w.name,
          codes: new Set<string>(),
        };
        entry.codes.add(w.code);
        byComponent.set(w.componentId, entry);
      }

      return [...byComponent.entries()].map(([filePath, { name, codes }]) => {
        const parts: string[] = [];
        if (codes.has("listeners-remain")) {
          parts.push("event listeners");
        }
        if (codes.has("timers-remain")) {
          parts.push("timers");
        }
        if (codes.has("watchers-remain")) {
          parts.push("watchers");
        }
        const list = parts.join(", ");

        return {
          ruleId: "memory-leak-detected",
          severity: "error" as const,
          component: name,
          filePath,
          problem: `Possible memory leak detected in component ${name} (${basename(filePath)}). Leftover: ${list}.`,
          suggestion:
            "Add cleanup in `onUnmounted`: `removeEventListener`, `clearTimeout` / `clearInterval`, and call `stop()` on manual watchers.",
          explanation:
            "When a component is removed from the page, everything it registered with the browser or Vue should be torn down. Otherwise those references keep the component alive in memory.",
        };
      });
    },
  },
];
