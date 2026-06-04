import { join } from "node:path";
import type { Plugin, ViteDevServer } from "vite";
import type { ViteResolveContext } from "./resolve/resolve-import.js";
import { normalizePath } from "vite";
import { AnalysisStore } from "./cache/analysis-store.js";
import { syncProjectGraph } from "./discovery/sync-project.js";
import { writeComponentGraph } from "./io/write-graph.js";
import { createViteResolver } from "./resolve/resolve-import.js";
import type {
  ComponentGraphFile,
  DependencyGraph,
  ProcessedModule,
  VueFileAnalysis,
  VueSentinelXPluginOptions,
} from "./types.js";
import { isMainVueModule, isVueModule } from "./utils.js";

export const PLUGIN_NAME = "vue-sentinel-x";
export const DEFAULT_GRAPH_OUTPUT = "analysis/component-graph.json";

const FLUSH_DEBOUNCE_MS = 200;

export type {
  ComponentGraphFile,
  DependencyGraph,
  ProcessedModule,
  VueFileAnalysis,
  VueSentinelXPluginOptions,
};

export { analyzeVueFile } from "./analysis/analyze-vue-file.js";
export { AnalysisStore } from "./cache/analysis-store.js";
export { DependencyGraphBuilder } from "./graph/index.js";

export function vueSentinelX(
  options: VueSentinelXPluginOptions = {},
): Plugin {
  const {
    logFiles = true,
    logGraph = true,
    graphOutput = DEFAULT_GRAPH_OUTPUT,
    graphScan = true,
  } = options;

  const store = new AnalysisStore();
  let projectRoot = process.cwd();
  let outputPath = join(projectRoot, DEFAULT_GRAPH_OUTPUT);
  let flushTimer: ReturnType<typeof setTimeout> | undefined;
  let flushInFlight: Promise<void> | undefined;
  let pluginContext: ViteResolveContext | undefined;
  let scanPromise: Promise<void> | undefined;

  const flushGraph = async (): Promise<void> => {
    if (!graphOutput || store.componentCount === 0) {
      return;
    }

    const resolvePath = pluginContext
      ? createViteResolver(pluginContext)
      : undefined;
    const graph = await store.buildGraph(projectRoot, resolvePath);
    await writeComponentGraph(outputPath, graph);

    if (logGraph) {
      console.log(
        `[${PLUGIN_NAME}] wrote ${graph.meta.componentCount} components, ${graph.meta.edgeCount} edges, ${graph.meta.sharedCount} shared → ${outputPath}`,
      );
    }
  };

  const scheduleFlush = (): void => {
    if (!graphOutput) {
      return;
    }
    if (flushTimer) {
      clearTimeout(flushTimer);
    }
    flushTimer = setTimeout(() => {
      flushTimer = undefined;
      flushInFlight = flushGraph().finally(() => {
        flushInFlight = undefined;
      });
    }, FLUSH_DEBOUNCE_MS);
  };

  const runInitialScan = (): Promise<void> => {
    if (!graphScan) {
      return Promise.resolve();
    }
    if (scanPromise) {
      return scanPromise;
    }
    scanPromise = (async () => {
      const updated = await syncProjectGraph(store, projectRoot);
      if (updated > 0 || store.componentCount > 0) {
        scheduleFlush();
      }
    })();
    return scanPromise;
  };

  const setupWatcher = (server: ViteDevServer): void => {
    const handlePath = (file: string): string => normalizePath(file);

    server.watcher.on("unlink", (file) => {
      const path = handlePath(file);
      if (!path.endsWith(".vue")) {
        return;
      }
      store.remove(path);
      scheduleFlush();
    });

    server.watcher.on("add", (file) => {
      const path = handlePath(file);
      if (!path.endsWith(".vue")) {
        return;
      }
      void store.analyzeFromDisk(path).then((changed) => {
        if (changed) {
          scheduleFlush();
        }
      });
    });
  };

  return {
    name: PLUGIN_NAME,
    enforce: "pre",

    configResolved(config) {
      projectRoot = config.root;
      outputPath = graphOutput
        ? join(projectRoot, graphOutput)
        : join(projectRoot, DEFAULT_GRAPH_OUTPUT);
    },

    async buildStart() {
      pluginContext = this;
      await runInitialScan();
    },

    configureServer(server) {
      void runInitialScan().then(() => {
        if (store.componentCount > 0) {
          scheduleFlush();
        }
      });
      setupWatcher(server);
    },

    transform(code, id) {
      pluginContext ??= this;

      const module: ProcessedModule = {
        id,
        isVue: isVueModule(id),
      };

      if (logFiles) {
        const label = module.isVue ? "vue" : "module";
        console.log(`[${PLUGIN_NAME}] ${label}: ${id}`);
      }

      if (isMainVueModule(id)) {
        const filePath = normalizePath(id);
        const changed = store.analyzeIfChanged(filePath, code);
        if (changed) {
          scheduleFlush();
        }
      }

      return null;
    },

    handleHotUpdate(ctx) {
      const file = normalizePath(ctx.file);
      if (!file.endsWith(".vue")) {
        return;
      }
      // Drop cache only; transform re-parses and schedules a graph write.
      store.invalidate(file);
      return ctx.modules;
    },

    async buildEnd() {
      if (flushTimer) {
        clearTimeout(flushTimer);
        flushTimer = undefined;
      }
      if (flushInFlight) {
        await flushInFlight;
      }
      await flushGraph();
    },
  };
}

export default vueSentinelX;
