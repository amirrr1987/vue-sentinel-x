import { captureRuntimeSnapshot } from "./snapshot.js";

export const BRIDGE_CHANNEL = "vue-sentinel-x:live";
export const BRIDGE_VERSION = 1;

export type BridgeMessageType =
  | "snapshot"
  | "ping"
  | "pong"
  | "stop";

export type BridgeMessage = {
  type: BridgeMessageType;
  version: number;
  timestamp: number;
  payload?: unknown;
};

export type LiveBridgeOptions = {
  /** Interval in ms between automatic snapshots (default: 1000) */
  intervalMs?: number;
  /** Whether to start broadcasting immediately (default: true) */
  autoStart?: boolean;
};

/**
 * LiveBridge broadcasts runtime snapshots to the dashboard
 * via BroadcastChannel — works across tabs on the same origin.
 *
 * Usage in main.ts:
 *   import { createLiveBridge } from "@vue-sentinel-x/runtime";
 *   const bridge = createLiveBridge({ intervalMs: 1500 });
 *   bridge.start();
 */
export class LiveBridge {
  private channel: BroadcastChannel | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private readonly intervalMs: number;

  constructor(options: LiveBridgeOptions = {}) {
    this.intervalMs = options.intervalMs ?? 1000;

    if (options.autoStart !== false) {
      this.start();
    }
  }

  start(): void {
    if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
      return;
    }

    if (this.channel) {
      return; // already running
    }

    this.channel = new BroadcastChannel(BRIDGE_CHANNEL);

    // Listen for ping from dashboard → reply with snapshot immediately
    this.channel.onmessage = (event: MessageEvent<BridgeMessage>) => {
      if (event.data?.type === "ping") {
        this.broadcast("pong");
        this.sendSnapshot();
      }
    };

    // Broadcast snapshot on interval
    this.timer = setInterval(() => {
      this.sendSnapshot();
    }, this.intervalMs);

    // Send an initial snapshot right away
    this.sendSnapshot();

    window.addEventListener("beforeunload", () => this.stop());
  }

  stop(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.channel) {
      this.broadcast("stop");
      this.channel.close();
      this.channel = null;
    }
  }

  /** Force-send a snapshot right now (e.g. after a user action). */
  flush(): void {
    this.sendSnapshot();
  }

  private sendSnapshot(): void {
    try {
      const snapshot = captureRuntimeSnapshot();
      this.broadcast("snapshot", snapshot);
    } catch {
      // silently ignore serialization errors
    }
  }

  private broadcast(type: BridgeMessageType, payload?: unknown): void {
    if (!this.channel) return;
    const msg: BridgeMessage = {
      type,
      version: BRIDGE_VERSION,
      timestamp: Date.now(),
      payload,
    };
    this.channel.postMessage(msg);
  }
}

/** Singleton bridge instance */
let _bridge: LiveBridge | null = null;

export function createLiveBridge(options: LiveBridgeOptions = {}): LiveBridge {
  if (_bridge) {
    _bridge.stop();
  }
  _bridge = new LiveBridge({ ...options, autoStart: false });
  return _bridge;
}

export function getLiveBridge(): LiveBridge | null {
  return _bridge;
}
