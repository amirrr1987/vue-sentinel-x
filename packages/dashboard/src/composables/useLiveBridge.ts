import { ref, shallowRef, onUnmounted, type Ref } from "vue";
import type { RuntimeReportSection } from "@vue-sentinel-x/core/browser";

export const BRIDGE_CHANNEL = "vue-sentinel-x:live";
export const BRIDGE_VERSION = 1;

export type BridgeStatus = "disconnected" | "waiting" | "connected" | "stopped";

export type LiveBridgeState = {
  status: Ref<BridgeStatus>;
  lastSnapshot: Ref<RuntimeReportSection | null>;
  lastUpdated: Ref<number | null>;
  snapshotCount: Ref<number>;
  connect: () => void;
  disconnect: () => void;
};

/**
 * Connects the dashboard to the app's LiveBridge via BroadcastChannel.
 *
 * Usage in a Vue component:
 *   const { status, lastSnapshot, connect } = useLiveBridge();
 *   connect(); // start listening
 */
export function useLiveBridge(): LiveBridgeState {
  const status = ref<BridgeStatus>("disconnected");
  const lastSnapshot = shallowRef<RuntimeReportSection | null>(null);
  const lastUpdated = ref<number | null>(null);
  const snapshotCount = ref(0);

  let channel: BroadcastChannel | null = null;
  let pingTimer: ReturnType<typeof setInterval> | null = null;
  let timeoutTimer: ReturnType<typeof setTimeout> | null = null;

  function resetTimeout() {
    if (timeoutTimer) clearTimeout(timeoutTimer);
    // If no snapshot arrives within 4s, mark as waiting
    timeoutTimer = setTimeout(() => {
      if (status.value === "connected") {
        status.value = "waiting";
      }
    }, 4000);
  }

  function connect() {
    if (channel) return;
    if (typeof BroadcastChannel === "undefined") {
      console.warn("[vue-sentinel-x dashboard] BroadcastChannel not supported in this environment.");
      return;
    }

    status.value = "waiting";
    channel = new BroadcastChannel(BRIDGE_CHANNEL);

    channel.onmessage = (event: MessageEvent) => {
      const msg = event.data;
      if (!msg || msg.version !== BRIDGE_VERSION) return;

      if (msg.type === "snapshot" || msg.type === "pong") {
        status.value = "connected";
        lastSnapshot.value = msg.payload as RuntimeReportSection;
        lastUpdated.value = msg.timestamp;
        snapshotCount.value++;
        resetTimeout();
      } else if (msg.type === "stop") {
        status.value = "stopped";
      }
    };

    channel.onmessageerror = () => {
      status.value = "waiting";
    };

    // Ping the app to request an immediate snapshot
    channel.postMessage({ type: "ping", version: BRIDGE_VERSION, timestamp: Date.now() });

    // Keep pinging every 2s in case the app tab reloads
    pingTimer = setInterval(() => {
      if (status.value !== "connected") {
        channel?.postMessage({ type: "ping", version: BRIDGE_VERSION, timestamp: Date.now() });
      }
    }, 2000);

    resetTimeout();
  }

  function disconnect() {
    if (pingTimer) { clearInterval(pingTimer); pingTimer = null; }
    if (timeoutTimer) { clearTimeout(timeoutTimer); timeoutTimer = null; }
    if (channel) { channel.close(); channel = null; }
    status.value = "disconnected";
  }

  onUnmounted(() => disconnect());

  return { status, lastSnapshot, lastUpdated, snapshotCount, connect, disconnect };
}
