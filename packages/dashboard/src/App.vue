<script setup lang="ts">
import { onMounted } from "vue";
import ComponentGraphPanel from "./components/ComponentGraphPanel.vue";
import DashboardHeader from "./components/DashboardHeader.vue";
import IssuesPanel from "./components/IssuesPanel.vue";
import MemoryPanel from "./components/MemoryPanel.vue";
import PerformancePanel from "./components/PerformancePanel.vue";
import { useSentinelData } from "./composables/useSentinelData.js";

const { snapshot, loading, error, bridgeStatus, snapshotCount, load } = useSentinelData({
  fetchLiveGraph: false,
  liveBridge: true,   // ← live bridge فعال
});

onMounted(() => {
  void load();
});
</script>

<template>
  <div class="app">
    <template v-if="loading">
      <p class="app__status">Loading analysis…</p>
    </template>

    <template v-else-if="error">
      <p class="app__status app__status--error">{{ error }}</p>
    </template>

    <template v-else-if="snapshot">
      <DashboardHeader
        :project-root="snapshot.projectRoot"
        :source="snapshot.source"
        :generated-at="snapshot.generatedAt"
        :issue-count="snapshot.report.findings.length"
        :bridge-status="bridgeStatus"
        :snapshot-count="snapshotCount"
        :last-updated="null"
      />

      <main class="grid">
        <ComponentGraphPanel :graph="snapshot.componentGraph" />
        <MemoryPanel
          :used-m-b="snapshot.memory.usedMB"
          :total-m-b="snapshot.memory.totalMB"
          :limit-m-b="snapshot.memory.limitMB"
          :history="snapshot.memory.history"
          :warning-count="snapshot.memory.warnings.length"
        />
        <PerformancePanel
          :records="snapshot.performance.records"
          :long-task-count="snapshot.performance.longTaskCount"
          :slow-component-count="snapshot.performance.slowComponentCount"
        />
        <IssuesPanel
          :summary="snapshot.report.summary"
          :findings="snapshot.report.findings"
        />
      </main>
    </template>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app__status {
  padding: 3rem;
  text-align: center;
  color: var(--muted);
}

.app__status--error {
  color: #fca5a5;
}

.grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  padding: 1rem 1.5rem 1.5rem;
  align-content: start;
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
