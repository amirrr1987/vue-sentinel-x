<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import type { ComponentGraphInput } from "vue-sentinel-x-core/browser";
import {
  graphRendererPlaceholder,
  shortPath,
  toVisNetworkData,
} from "../adapters/graph-adapter.js";

const props = defineProps<{
  graph: ComponentGraphInput;
}>();

const canvasRef = ref<HTMLElement | null>(null);

const visData = computed(() => toVisNetworkData(props.graph));

const meta = computed(() => ({
  nodes: visData.value.nodes.length,
  edges: visData.value.edges.length,
  shared: props.graph.sharedComponents?.length ?? 0,
}));

onMounted(() => {
  if (!canvasRef.value) {
    return;
  }
  graphRendererPlaceholder(canvasRef.value, visData.value);
});
</script>

<template>
  <section class="panel">
    <div class="panel__row">
      <h2 class="panel__title">Component graph</h2>
      <span class="placeholder-tag">vis-network ready</span>
    </div>
    <p class="panel__hint">
      {{ meta.nodes }} components · {{ meta.edges }} edges ·
      {{ meta.shared }} shared
    </p>

    <div ref="canvasRef" class="graph-canvas">
      <ul class="graph-list">
        <li v-for="node in visData.nodes" :key="node.id">
          <strong>{{ node.label }}</strong>
          <span v-if="graph.sharedComponents?.some((s) => s.id === node.id)">
            (shared)
          </span>
          — {{ shortPath(node.id) }}
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.panel__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
</style>
