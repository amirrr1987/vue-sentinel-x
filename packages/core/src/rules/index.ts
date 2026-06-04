import { badWatcherRules } from "./bad-watchers.js";
import { largeComponentRules } from "./large-components.js";
import { memoryLeakRules } from "./memory-leaks.js";
import { unnecessaryReactivityRules } from "./unnecessary-reactivity.js";
import type { SentinelRule } from "./types.js";

export type { SentinelRule } from "./types.js";

export const defaultRules: SentinelRule[] = [
  ...memoryLeakRules,
  ...badWatcherRules,
  ...unnecessaryReactivityRules,
  ...largeComponentRules,
];

export {
  memoryLeakRules,
  badWatcherRules,
  unnecessaryReactivityRules,
  largeComponentRules,
};
