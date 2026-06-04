import type { LifecycleTracker } from "../tracker.js";
import { resolveComponentId } from "./resolve-component.js";
import type { ResourceRegistry } from "./resource-registry.js";

type ListenerTarget = EventTarget | typeof globalThis;

let globalsPatched = false;

function describeTarget(target: ListenerTarget): string {
  if (target === globalThis || target === window) {
    return "global";
  }
  if (typeof Element !== "undefined" && target instanceof Element) {
    return target.tagName.toLowerCase() + (target.id ? `#${target.id}` : "");
  }
  return (target as { constructor?: { name?: string } }).constructor?.name ?? "EventTarget";
}

export function installGlobalPatches(
  tracker: LifecycleTracker,
  registry: ResourceRegistry,
): void {
  if (globalsPatched || typeof globalThis === "undefined") {
    return;
  }
  globalsPatched = true;

  const win = globalThis as typeof globalThis & Window;

  patchEventTarget(tracker, registry);
  patchTimers(win, tracker, registry);
}

function patchEventTarget(
  tracker: LifecycleTracker,
  registry: ResourceRegistry,
): void {
  const proto = EventTarget.prototype;
  const originalAdd = proto.addEventListener;
  const originalRemove = proto.removeEventListener;

  proto.addEventListener = function (
    this: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions,
  ) {
    const componentId = resolveComponentId(tracker);
    if (componentId && listener) {
      registry.trackListener(componentId, {
        target: describeTarget(this),
        event: String(type),
      });
    }
    return originalAdd.call(this, type, listener, options);
  };

  proto.removeEventListener = function (
    this: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | EventListenerOptions,
  ) {
    const componentId = resolveComponentId(tracker);
    if (componentId) {
      registry.markListenerRemoved(
        componentId,
        describeTarget(this),
        String(type),
      );
    }
    return originalRemove.call(this, type, listener, options);
  };
}

function patchTimers(
  win: typeof globalThis & Window,
  tracker: LifecycleTracker,
  registry: ResourceRegistry,
): void {
  const originalSetTimeout = win.setTimeout.bind(win);
  const originalSetInterval = win.setInterval.bind(win);
  const originalClearTimeout = win.clearTimeout.bind(win);
  const originalClearInterval = win.clearInterval.bind(win);

  win.setTimeout = ((handler: TimerHandler, delay?: number, ...args: unknown[]) => {
    const componentId = resolveComponentId(tracker);
    let timerId = 0;

    const wrapped: TimerHandler = (...innerArgs: unknown[]) => {
      try {
        if (typeof handler === "function") {
          return handler(...innerArgs);
        }
        return undefined;
      } finally {
        registry.markTimerClearedAny(timerId);
      }
    };

    timerId = originalSetTimeout(wrapped, delay, ...args) as unknown as number;
    if (componentId) {
      registry.trackTimer(componentId, {
        timerId,
        type: "setTimeout",
        delay: delay ?? 0,
      });
    }
    return timerId;
  }) as typeof win.setTimeout;

  win.setInterval = ((handler: TimerHandler, delay?: number, ...args: unknown[]) => {
    const timerId = originalSetInterval(handler, delay, ...args) as unknown as number;
    const componentId = resolveComponentId(tracker);
    if (componentId) {
      registry.trackTimer(componentId, {
        timerId,
        type: "setInterval",
        delay: delay ?? 0,
      });
    }
    return timerId;
  }) as typeof win.setInterval;

  win.clearTimeout = ((timerId?: number) => {
    if (timerId !== undefined) {
      registry.markTimerClearedAny(timerId);
    }
    return originalClearTimeout(timerId);
  }) as typeof win.clearTimeout;

  win.clearInterval = ((timerId?: number) => {
    if (timerId !== undefined) {
      registry.markTimerClearedAny(timerId);
    }
    return originalClearInterval(timerId);
  }) as typeof win.clearInterval;
}
