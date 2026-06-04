import { createComponentId } from "../id.js";
import type {
  ComponentResourceBundle,
  TrackedListener,
  TrackedTimer,
  TrackedWatcher,
} from "./types.js";

function emptyBundle(): ComponentResourceBundle {
  return { listeners: [], timers: [], watchers: [] };
}

export class ResourceRegistry {
  private readonly byComponent = new Map<string, ComponentResourceBundle>();

  getOrCreate(componentId: string): ComponentResourceBundle {
    let bundle = this.byComponent.get(componentId);
    if (!bundle) {
      bundle = emptyBundle();
      this.byComponent.set(componentId, bundle);
    }
    return bundle;
  }

  get(componentId: string): ComponentResourceBundle | undefined {
    return this.byComponent.get(componentId);
  }

  trackListener(
    componentId: string,
    entry: Omit<TrackedListener, "kind" | "id" | "createdAt" | "removed"> & {
      removed?: boolean;
    },
  ): TrackedListener {
    const record: TrackedListener = {
      kind: "listener",
      id: createComponentId(),
      createdAt: Date.now(),
      removed: entry.removed ?? false,
      target: entry.target,
      event: entry.event,
    };
    this.getOrCreate(componentId).listeners.push(record);
    return record;
  }

  markListenerRemoved(
    componentId: string,
    target: string,
    event: string,
  ): void {
    const bundle = this.byComponent.get(componentId);
    if (!bundle) {
      return;
    }
    for (let i = bundle.listeners.length - 1; i >= 0; i -= 1) {
      const listener = bundle.listeners[i]!;
      if (
        !listener.removed &&
        listener.target === target &&
        listener.event === event
      ) {
        listener.removed = true;
        return;
      }
    }
  }

  trackTimer(
    componentId: string,
    entry: Omit<TrackedTimer, "kind" | "id" | "createdAt" | "cleared">,
  ): TrackedTimer {
    const record: TrackedTimer = {
      kind: "timer",
      id: createComponentId(),
      createdAt: Date.now(),
      cleared: false,
      ...entry,
    };
    this.getOrCreate(componentId).timers.push(record);
    return record;
  }

  markTimerCleared(componentId: string, timerId: number): void {
    const bundle = this.byComponent.get(componentId);
    if (!bundle) {
      return;
    }
    for (const timer of bundle.timers) {
      if (!timer.cleared && timer.timerId === timerId) {
        timer.cleared = true;
        return;
      }
    }
  }

  markTimerClearedAny(timerId: number): void {
    for (const bundle of this.byComponent.values()) {
      for (const timer of bundle.timers) {
        if (!timer.cleared && timer.timerId === timerId) {
          timer.cleared = true;
          return;
        }
      }
    }
  }

  trackWatcher(
    componentId: string,
    entry: Omit<TrackedWatcher, "kind" | "id" | "createdAt" | "stopped">,
  ): TrackedWatcher {
    const record: TrackedWatcher = {
      kind: "watcher",
      id: createComponentId(),
      createdAt: Date.now(),
      stopped: false,
      ...entry,
    };
    this.getOrCreate(componentId).watchers.push(record);
    return record;
  }

  markWatcherStopped(componentId: string, stop: () => void): void {
    const bundle = this.byComponent.get(componentId);
    if (!bundle) {
      return;
    }
    for (const watcher of bundle.watchers) {
      if (!watcher.stopped && watcher.stop === stop) {
        watcher.stopped = true;
        return;
      }
    }
  }

  removeComponent(componentId: string): void {
    this.byComponent.delete(componentId);
  }

  clear(): void {
    this.byComponent.clear();
  }

  getActiveResources(
    componentId: string,
  ): ComponentResourceBundle | undefined {
    const bundle = this.byComponent.get(componentId);
    if (!bundle) {
      return undefined;
    }
    return {
      listeners: bundle.listeners.filter((l) => !l.removed),
      timers: bundle.timers.filter((t) => !t.cleared),
      watchers: bundle.watchers.filter((w) => !w.stopped),
    };
  }
}
