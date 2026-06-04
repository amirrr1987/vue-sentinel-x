<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import type { PerformanceRecordInput } from "@vue-sentinel-x/core";
import {
  chartRendererPlaceholder,
  mountDurationSeries,
} from "../adapters/chart-adapter.js";

const props = defineProps<{
  records: PerformanceRecordInput[];
  longTaskCount: number;
  slowComponentCount: number;
}>();

const chartRef = ref<HTMLElement | null>(null);

const avgMount = computed(() => {
  const values = props.records
    .map((r) => r.mountDurationMs)
    .filter((v): v is number => v !== null);
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((a, b) => a + b, 0) / values.length;
});

onMounted(() => {
  if (!chartRef.value) {
    return;
  }
  chartRendererPlaceholder(chartRef.value, {
    type: "bar",
    series: [mountDurationSeries(props.records)],
  });
});
</script>

<template>
  <section class="panel">
    <div class="panel__row">
      <h2 class="panel__title">Performance</h2>
      <span class="placeholder-tag">chart library ready</span>
    </div>
    <p class="panel__hint">Mount / update timings from runtime tracker</p>

    <div class="stat-grid">
      <div class="stat">
        <p class="stat__label">Avg mount</p>
        <p class="stat__value">{{ avgMount.toFixed(1) }} ms</p>
      </div>
      <div class="stat">
        <p class="stat__label">Slow</p>
        <p class="stat__value">{{ slowComponentCount }}</p>
      </div>
      <div class="stat">
        <p class="stat__label">Long tasks</p>
        <p class="stat__value">{{ longTaskCount }}</p>
      </div>
    </div>

    <div ref="chartRef" class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Component</th>
            <th>Mount</th>
            <th>Updates</th>
            <th>Avg update</th>
            <th>Max</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in records"
            :key="row.componentId"
            :class="{ 'row--slow': row.isSlow }"
          >
            <td>{{ row.name }}</td>
            <td>{{ row.mountDurationMs?.toFixed(1) ?? "—" }} ms</td>
            <td>{{ row.updates.count }}</td>
            <td>{{ row.updates.avgMs.toFixed(1) }} ms</td>
            <td>{{ row.updates.maxMs.toFixed(1) }} ms</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.panel__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.row--slow td {
  color: #fcd34d;
}
</style>
