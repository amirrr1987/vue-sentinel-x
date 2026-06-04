export type ResourceKind = "listener" | "timer" | "watcher";

export type TrackedListener = {
  kind: "listener";
  id: string;
  target: string;
  event: string;
  createdAt: number;
  removed: boolean;
};

export type TrackedTimer = {
  kind: "timer";
  id: string;
  timerId: number;
  type: "setTimeout" | "setInterval";
  delay: number;
  createdAt: number;
  cleared: boolean;
};

export type TrackedWatcher = {
  kind: "watcher";
  id: string;
  type: "watch" | "watchEffect";
  createdAt: number;
  stopped: boolean;
  stop?: () => void;
};

export type TrackedResource = TrackedListener | TrackedTimer | TrackedWatcher;

export type ComponentResourceBundle = {
  listeners: TrackedListener[];
  timers: TrackedTimer[];
  watchers: TrackedWatcher[];
};

export type MemoryWarningCode =
  | "listeners-remain"
  | "timers-remain"
  | "watchers-remain"
  | "heap-growth";

export type MemoryWarning = {
  code: MemoryWarningCode;
  componentId: string;
  name: string;
  message: string;
  resources?: TrackedResource[];
  heapDeltaBytes?: number;
};

export type MemorySnapshot = {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  capturedAt: number;
};
