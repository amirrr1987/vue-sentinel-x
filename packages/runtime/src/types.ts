/** Lifecycle record stored in the global tracker. */
export type ComponentLifecycleRecord = {
  componentId: string;
  name: string;
  mountedAt: number | null;
  unmountedAt: number | null;
};

export type LifecycleEventType = "mounted" | "unmounted";

export type LifecycleEvent = {
  type: LifecycleEventType;
  componentId: string;
  name: string;
  timestamp: number;
};

export type SentinelRuntimeOptions = {
  /** Log mount/unmount events to the console. Default: true */
  logLifecycle?: boolean;
};

export type SentinelRuntime = {
  plugin: import("vue").Plugin;
  tracker: import("./tracker.js").LifecycleTracker;
};
