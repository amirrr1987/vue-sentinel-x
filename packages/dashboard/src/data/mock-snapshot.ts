import {
  buildIntelligenceContext,
  intelligenceEngine,
} from "@amirrr1987/vue-sentinel-x-core/browser";
import type { SentinelSnapshot } from "../types.js";

const graph = {
  meta: {
    componentCount: 6,
    edgeCount: 7,
    sharedCount: 1,
  },
  components: [
    {
      id: "/src/App.vue",
      name: "App",
      children: ["/src/views/Home.vue", "/src/components/AppHeader.vue"],
      parents: [],
      importedComponents: [
        { localName: "Home", specifier: "./views/Home.vue" },
        { localName: "AppHeader", specifier: "./components/AppHeader.vue" },
      ],
      structure: { hasScript: true, hasTemplate: true, scriptSetup: true },
    },
    {
      id: "/src/views/Home.vue",
      name: "Home",
      children: [
        "/src/components/UserCard.vue",
        "/src/components/StatsPanel.vue",
      ],
      parents: ["/src/App.vue"],
      importedComponents: [
        { localName: "UserCard", specifier: "../components/UserCard.vue" },
        { localName: "StatsPanel", specifier: "../components/StatsPanel.vue" },
      ],
      structure: { hasScript: true, hasTemplate: true, scriptSetup: true },
    },
    {
      id: "/src/components/AppHeader.vue",
      name: "AppHeader",
      children: ["/src/components/NavLink.vue"],
      parents: ["/src/App.vue"],
      importedComponents: [
        { localName: "NavLink", specifier: "./NavLink.vue" },
      ],
      structure: { hasScript: true, hasTemplate: true, scriptSetup: true },
    },
    {
      id: "/src/components/UserCard.vue",
      name: "UserCard",
      children: ["/src/components/BaseButton.vue"],
      parents: ["/src/views/Home.vue"],
      importedComponents: [
        { localName: "BaseButton", specifier: "./BaseButton.vue" },
      ],
      structure: { hasScript: true, hasTemplate: true, scriptSetup: true },
    },
    {
      id: "/src/components/StatsPanel.vue",
      name: "StatsPanel",
      children: ["/src/components/BaseButton.vue"],
      parents: ["/src/views/Home.vue"],
      importedComponents: [
        { localName: "BaseButton", specifier: "./BaseButton.vue" },
      ],
      structure: { hasScript: true, hasTemplate: true, scriptSetup: true },
    },
    {
      id: "/src/components/BaseButton.vue",
      name: "BaseButton",
      children: [],
      parents: [
        "/src/components/UserCard.vue",
        "/src/components/StatsPanel.vue",
      ],
      importedComponents: [],
      structure: { hasScript: true, hasTemplate: true, scriptSetup: true },
    },
    {
      id: "/src/components/NavLink.vue",
      name: "NavLink",
      children: [],
      parents: ["/src/components/AppHeader.vue"],
      importedComponents: [],
      structure: { hasScript: true, hasTemplate: true, scriptSetup: true },
    },
  ],
  sharedComponents: [
    {
      id: "/src/components/BaseButton.vue",
      name: "BaseButton",
      usageCount: 2,
      usedBy: [
        "/src/components/UserCard.vue",
        "/src/components/StatsPanel.vue",
      ],
    },
  ],
};

const memoryWarnings = [
  {
    code: "listeners-remain",
    componentId: "/src/views/Home.vue",
    name: "Home",
    message: "1 event listener(s) were not removed before unmount",
  },
];

const performanceRecords = [
  {
    componentId: "/src/App.vue",
    name: "App",
    mountDurationMs: 42,
    renderTimeMs: 42,
    updates: { count: 12, avgMs: 4.2, maxMs: 11, totalMs: 50 },
    isSlow: false,
    slowReasons: [],
  },
  {
    componentId: "/src/views/Home.vue",
    name: "Home",
    mountDurationMs: 68,
    renderTimeMs: 68,
    updates: { count: 94, avgMs: 6.1, maxMs: 22, totalMs: 573 },
    isSlow: true,
    slowReasons: ["update #94 took 22.0ms"],
  },
  {
    componentId: "/src/components/StatsPanel.vue",
    name: "StatsPanel",
    mountDurationMs: 31,
    renderTimeMs: 31,
    updates: { count: 8, avgMs: 3.1, maxMs: 9, totalMs: 25 },
    isSlow: false,
    slowReasons: [],
  },
];

function buildReport() {
  const context = buildIntelligenceContext({
    projectRoot: "/demo-app",
    componentGraph: graph,
    memoryWarnings,
    performanceRecords,
    longTasks: [{ durationMs: 72, componentName: "Home" }],
  });
  return intelligenceEngine.analyze(context);
}

export function createMockSnapshot(): SentinelSnapshot {
  const report = buildReport();

  return {
    source: "mock",
    projectRoot: "/demo-app",
    generatedAt: new Date().toISOString(),
    componentGraph: graph,
    memory: {
      usedMB: 48.2,
      totalMB: 64,
      limitMB: 2048,
      history: [
        { label: "0s", usedMB: 32 },
        { label: "10s", usedMB: 38 },
        { label: "20s", usedMB: 42 },
        { label: "30s", usedMB: 45 },
        { label: "40s", usedMB: 48.2 },
      ],
      warnings: memoryWarnings,
    },
    performance: {
      records: performanceRecords,
      longTaskCount: 1,
      slowComponentCount: performanceRecords.filter((r) => r.isSlow).length,
    },
    report,
  };
}
