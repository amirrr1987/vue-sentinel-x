import { ref, shallowRef, type Ref } from "vue";
import type { SentinelReportFile } from "@vue-sentinel-x/core/browser";
import { createMockSnapshot } from "../data/mock-snapshot.js";
import type { SentinelSnapshot } from "../types.js";

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

const GRAPH_URL = "/analysis/component-graph.json";
const REPORT_URL = "/analysis/sentinel-report.json";

export type UseSentinelDataOptions = {
  /** Try to load live graph JSON from the Vite plugin output */
  fetchLiveGraph?: boolean;
};

/**
 * Loads dashboard data.
 * Today: mock snapshot + Intelligence Engine report.
 * Later: merge live graph JSON + runtime `window.__SENTINEL__` bridge.
 */
export function useSentinelData(options: UseSentinelDataOptions = {}) {
  const snapshot = shallowRef<SentinelSnapshot | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

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
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e);
    } finally {
      loading.value = false;
    }
  }

  return {
    snapshot: snapshot as Ref<SentinelSnapshot | null>,
    loading,
    error,
    load,
    refresh: load,
  };
}

async function tryFetchReport(): Promise<SentinelReportFile | null> {
  try {
    const res = await fetch(REPORT_URL);
    if (!res.ok) {
      return null;
    }
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
    if (!res.ok) {
      return null;
    }
    return (await res.json()) as {
      components: SentinelSnapshot["componentGraph"]["components"];
      sharedComponents?: SentinelSnapshot["componentGraph"]["sharedComponents"];
      meta?: SentinelSnapshot["componentGraph"]["meta"];
    };
  } catch {
    return null;
  }
}
