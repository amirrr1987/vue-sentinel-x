import { ref, shallowRef, type Ref } from "vue";
import { createMockSnapshot } from "../data/mock-snapshot.js";
import type { SentinelSnapshot } from "../types.js";

const GRAPH_URL = "/analysis/component-graph.json";

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
