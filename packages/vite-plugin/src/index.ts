import { join } from "node:path";
import {
  buildSentinelReport,
  isFeatureEnabled,
  resolveConfig,
  writeReports,
  type SentinelConfig,
} from "vue-sentinel-x-core";
import type { Plugin, ViteDevServer } from "vite";
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
} from "./types.js";
import { isMainVueModule, isVueModule } from "./utils.js";

export const PLUGIN_NAME = "vue-sentinel-x";
export const DEFAULT_GRAPH_OUTPUT = "analysis/component-graph.json";

export type VueSentinelXPluginOptions = SentinelConfig;

export type {
  ComponentGraphFile,
  DependencyGraph,
  ProcessedModule,
  VueFileAnalysis,
};

export { analyzeVueFile } from "./analysis/analyze-vue-file.js";
export { AnalysisStore } from "./cache/analysis-store.js";
export { DependencyGraphBuilder } from "./graph/index.js";
export { resolveConfig, type SentinelConfig } from "vue-sentinel-x-core";

export function vueSentinelX(
  options: VueSentinelXPluginOptions = {},
): Plugin {
  const config = resolveConfig(options);
  const graphEnabled = isFeatureEnabled(config, "graph");
  const intelligenceEnabled = isFeatureEnabled(config, "intelligence");
  const reportsEnabled =
    config.enabled && config.reports.enabled && config.features.reports;

  const logFiles = !config.performance.quiet && (config.logFiles ?? false);
  const logGraph = config.logGraph ?? true;
  const graphOutput = graphEnabled ? config.graphOutput : false;
  const graphScan = graphEnabled && (config.graphScan ?? true);
  const debounceMs = config.performance.graphDebounceMs ?? 250;

  const store = new AnalysisStore();
  let projectRoot = process.cwd();
  let outputDir = join(projectRoot, config.reports.outputDir);
  let graphPath = graphOutput
    ? join(projectRoot, graphOutput)
    : join(projectRoot, DEFAULT_GRAPH_OUTPUT);
  let flushTimer: ReturnType<typeof setTimeout> | undefined;
  let flushInFlight: Promise<void> | undefined;
  let pluginContext: import("./resolve/resolve-import.js").ViteResolveContext | undefined;
  let scanPromise: Promise<void> | undefined;
  let lastGraph: ComponentGraphFile | undefined;

  if (!config.enabled) {
    return { name: PLUGIN_NAME };
  }

  const flushGraph = async (): Promise<void> => {
    if (!graphOutput || store.componentCount === 0) {
      return;
    }

    const resolvePath = pluginContext
      ? createViteResolver(pluginContext)
      : undefined;
    const graph = await store.buildGraph(projectRoot, resolvePath);
    lastGraph = graph;
    await writeComponentGraph(graphPath, graph);

    if (logGraph) {
      console.log(
        `[${PLUGIN_NAME}] graph: ${graph.meta.componentCount} components → ${graphPath}`,
      );
    }
  };

  const writeAnalysisReports = async (): Promise<void> => {
    if (!reportsEnabled || !intelligenceEnabled) {
      return;
    }

    const report = buildSentinelReport({
      projectRoot,
      source: "build",
      componentGraph: lastGraph,
      learningMode: config.features.learningMode,
    });

    const paths = await writeReports({
      outputDir,
      report,
      json: config.reports.json,
      html: config.reports.html,
      jsonFilename: config.reports.jsonFilename,
      htmlFilename: config.reports.htmlFilename,
    });

    if (logGraph && (paths.jsonPath || paths.htmlPath)) {
      console.log(
        `[${PLUGIN_NAME}] reports: ${[paths.jsonPath, paths.htmlPath].filter(Boolean).join(", ")}`,
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
    }, debounceMs);
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
    if (!graphEnabled) {
      return;
    }

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

    configResolved(resolved) {
      projectRoot = resolved.root;
      outputDir = join(projectRoot, config.reports.outputDir);
      graphPath = graphOutput
        ? join(projectRoot, graphOutput)
        : join(projectRoot, DEFAULT_GRAPH_OUTPUT);
    },

    async buildStart() {
      if (!graphEnabled) {
        return;
      }
      pluginContext = this;
      await runInitialScan();
    },

    configureServer(server) {
      if (!graphEnabled) {
        return;
      }
      void runInitialScan();
      setupWatcher(server);
    },

    transform(code, id) {
      if (!graphEnabled) {
        return null;
      }

      pluginContext ??= this;

      if (logFiles) {
        const label = isVueModule(id) ? "vue" : "module";
        console.log(`[${PLUGIN_NAME}] ${label}: ${id}`);
      }

      if (isMainVueModule(id)) {
        const filePath = normalizePath(id);
        if (store.analyzeIfChanged(filePath, code)) {
          scheduleFlush();
        }
      }

      return null;
    },

    handleHotUpdate(ctx) {
      if (!graphEnabled) {
        return;
      }
      const file = normalizePath(ctx.file);
      if (!file.endsWith(".vue")) {
        return;
      }
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
      if (graphEnabled) {
        await flushGraph();
      }
      await writeAnalysisReports();
    },
  };
}

export default vueSentinelX;
