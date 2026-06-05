import { ref, shallowRef, watch, type Ref } from "vue";
import type { SentinelReportFile, RuntimeReportSection } from "vue-sentinel-x-core/browser";
import { createMockSnapshot } from "../data/mock-snapshot.js";
import type { SentinelSnapshot } from "../types.js";
import { useLiveBridge, type BridgeStatus } from "./useLiveBridge.js";

function reportToSnapshot(report: SentinelReportFile): SentinelSnapshot {
  return {
    source: "live",
    projectRoot: report.meta.projectRoot,
    generatedAt: report.meta.generatedAt,
    componentGraph: report.componentGraph ?? {
      components: [],
    },
    memory: {
      usedMB: (report.runtime?.memory?.heap?.usedJSHeapSize ?? 0) / 1024 / 1024,
      totalMB: (report.runtime?.memory?.heap?.totalJSHeapSize ?? 0) / 1024 / 1024,
      limitMB: (report.runtime?.memory?.heap?.jsHeapSizeLimit ?? 0) / 1024 / 1024,
      history: [{ label: "now", usedMB: 0 }],
      warnings: report.runtime?.memory?.warnings ?? [],
    },
    performance: {
      records: (report.runtime?.performance?.records ?? []).map((r) => ({
        componentId: r.name,
        name: r.name,
        mountDurationMs: r.mountDurationMs,
        updates: {
          count: r.updateCount,
          avgMs: r.avgUpdateMs,
          maxMs: r.avgUpdateMs,
        },
      })),
      longTaskCount: report.runtime?.performance?.longTaskCount ?? 0,
      slowComponentCount: report.runtime?.performance?.slowComponentCount ?? 0,
    },
    report: report.intelligence,
  };
}

/** Merge a live RuntimeReportSection into an existing snapshot */
function mergeRuntimeIntoSnapshot(
  base: SentinelSnapshot,
  runtime: RuntimeReportSection,
  timestamp: number,
): SentinelSnapshot {
  const heap = runtime.memory?.heap;
  const usedMB = heap ? heap.usedJSHeapSize / 1024 / 1024 : base.memory.usedMB;
  const totalMB = heap ? heap.totalJSHeapSize / 1024 / 1024 : base.memory.totalMB;
  const limitMB = heap ? heap.jsHeapSizeLimit / 1024 / 1024 : base.memory.limitMB;

  // Append a history point (keep last 20)
  const label = new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const history = [
    ...base.memory.history.slice(-19),
    { label, usedMB },
  ];

  const perfRecords = (runtime.performance?.records ?? []).map((r) => ({
    componentId: r.name,
    name: r.name,
    mountDurationMs: r.mountDurationMs,
    updates: {
      count: r.updateCount,
      avgMs: r.avgUpdateMs,
      maxMs: r.avgUpdateMs,
    },
  }));

  return {
    ...base,
    source: "live",
    generatedAt: new Date(timestamp).toISOString(),
    memory: {
      usedMB,
      totalMB,
      limitMB,
      history,
      warnings: runtime.memory?.warnings ?? base.memory.warnings,
    },
    performance: {
      records: perfRecords.length > 0 ? perfRecords : base.performance.records,
      longTaskCount: runtime.performance?.longTaskCount ?? base.performance.longTaskCount,
      slowComponentCount: runtime.performance?.slowComponentCount ?? base.performance.slowComponentCount,
    },
  };
}

const GRAPH_URL = "/analysis/component-graph.json";
const REPORT_URL = "/analysis/sentinel-report.json";

export type UseSentinelDataOptions = {
  /** Try to load live graph JSON from the Vite plugin output */
  fetchLiveGraph?: boolean;
  /** Connect to the runtime LiveBridge (BroadcastChannel) for real-time data */
  liveBridge?: boolean;
};

export function useSentinelData(options: UseSentinelDataOptions = {}) {
  const snapshot = shallowRef<SentinelSnapshot | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Live bridge
  const bridge = options.liveBridge ? useLiveBridge() : null;
  const bridgeStatus = bridge?.status ?? ref<BridgeStatus>("disconnected");

  // When a new snapshot arrives from the bridge, merge it in
  if (bridge) {
    watch(bridge.lastSnapshot, (runtime) => {
      if (!runtime || !snapshot.value) return;
      snapshot.value = mergeRuntimeIntoSnapshot(
        snapshot.value,
        runtime,
        bridge.lastUpdated.value ?? Date.now(),
      );
    });
  }

  async function load(): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      let data = createMockSnapshot();

      if (options.fetchLiveGraph) {
        const liveReport = await tryFetchReport();
        if (liveReport) {
          data = reportToSnapshot(liveReport);
        } else {
          const live = await tryFetchGraph();
          if (live) {
            data = {
              ...data,
              source: "live",
              componentGraph: {
                components: live.components,
                sharedComponents: live.sharedComponents,
                meta: live.meta,
              },
            };
          }
        }
      }

      snapshot.value = data;

      // Start live bridge after base data is loaded
      if (bridge) {
        bridge.connect();
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e);
    } finally {
      loading.value = false;
    }
  }

  function disconnect() {
    bridge?.disconnect();
  }

  return {
    snapshot: snapshot as Ref<SentinelSnapshot | null>,
    loading,
    error,
    bridgeStatus,
    snapshotCount: bridge?.snapshotCount ?? ref(0),
    load,
    refresh: load,
    disconnect,
  };
}

async function tryFetchReport(): Promise<SentinelReportFile | null> {
  try {
    const res = await fetch(REPORT_URL);
    if (!res.ok) return null;
    return (await res.json()) as SentinelReportFile;
  } catch {
    return null;
  }
}

async function tryFetchGraph(): Promise<{
  components: SentinelSnapshot["componentGraph"]["components"];
  sharedComponents?: SentinelSnapshot["componentGraph"]["sharedComponents"];
  meta?: SentinelSnapshot["componentGraph"]["meta"];
} | null> {
  try {
    const res = await fetch(GRAPH_URL);
    if (!res.ok) return null;
    return (await res.json()) as {
      components: SentinelSnapshot["componentGraph"]["components"];
      sharedComponents?: SentinelSnapshot["componentGraph"]["sharedComponents"];
      meta?: SentinelSnapshot["componentGraph"]["meta"];
    };
  } catch {
    return null;
  }
}
