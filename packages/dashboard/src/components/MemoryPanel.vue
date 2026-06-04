<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  chartRendererPlaceholder,
  memorySeriesFromHistory,
} from "../adapters/chart-adapter.js";

const props = defineProps<{
  usedMB: number;
  totalMB: number;
  limitMB: number;
  history: Array<{ label: string; usedMB: number }>;
  warningCount: number;
}>();

const chartRef = ref<HTMLElement | null>(null);

const maxHistory = computed(() =>
  Math.max(...props.history.map((h) => h.usedMB), 1),
);

const usagePercent = computed(() =>
  Math.round((props.usedMB / props.limitMB) * 100),
);

onMounted(() => {
  if (!chartRef.value) {
    return;
  }
  chartRendererPlaceholder(chartRef.value, {
    type: "line",
    series: [memorySeriesFromHistory(props.history)],
  });
});
</script>

<template>
  <section class="panel">
    <div class="panel__row">
      <h2 class="panel__title">Memory</h2>
      <span class="placeholder-tag">chart library ready</span>
    </div>
    <p class="panel__hint">Mock heap snapshot · {{ warningCount }} warnings</p>

    <div class="stat-grid">
      <div class="stat">
        <p class="stat__label">Used</p>
        <p class="stat__value">{{ usedMB.toFixed(1) }} MB</p>
      </div>
      <div class="stat">
        <p class="stat__label">Total</p>
        <p class="stat__value">{{ totalMB.toFixed(0) }} MB</p>
      </div>
      <div class="stat">
        <p class="stat__label">Limit</p>
        <p class="stat__value">{{ limitMB.toFixed(0) }} MB</p>
      </div>
      <div class="stat">
        <p class="stat__label">Usage</p>
        <p class="stat__value">{{ usagePercent }}%</p>
      </div>
    </div>

    <div ref="chartRef" class="chart-bars" aria-label="Memory history chart">
      <div
        v-for="point in history"
        :key="point.label"
        class="chart-bars__item"
      >
        <div
          class="chart-bars__bar"
          :style="{ height: `${(point.usedMB / maxHistory) * 100}%` }"
        />
        <span class="chart-bars__label">{{ point.label }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.panel__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
