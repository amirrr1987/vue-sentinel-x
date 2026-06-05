<script setup lang="ts">
import type { BridgeStatus } from "../composables/useLiveBridge.js";

defineProps<{
  status: BridgeStatus;
  snapshotCount: number;
  lastUpdated: number | null;
}>();

const labels: Record<BridgeStatus, string> = {
  disconnected: "Disconnected",
  waiting: "Waiting for app…",
  connected: "Live",
  stopped: "App closed",
};

const hints: Record<BridgeStatus, string> = {
  disconnected: "Call createLiveBridge() in your app's main.ts",
  waiting: "Make sure your app has @vue-sentinel-x/runtime installed with createLiveBridge()",
  connected: "Receiving live data from your app",
  stopped: "The app tab was closed or bridge was stopped",
};
</script>

<template>
  <div class="bridge-indicator" :data-status="status" :title="hints[status]">
    <span class="bridge-indicator__dot" />
    <span class="bridge-indicator__label">{{ labels[status] }}</span>
    <span v-if="status === 'connected' && snapshotCount > 0" class="bridge-indicator__count">
      {{ snapshotCount }} updates
    </span>
  </div>
</template>

<style scoped>
.bridge-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid transparent;
  cursor: default;
  user-select: none;
  transition: background 0.2s;
}

.bridge-indicator__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.bridge-indicator__count {
  opacity: 0.6;
  font-variant-numeric: tabular-nums;
}

/* disconnected */
.bridge-indicator[data-status="disconnected"] {
  background: rgba(255,255,255,0.05);
  border-color: rgba(255,255,255,0.1);
  color: var(--muted, #888);
}
.bridge-indicator[data-status="disconnected"] .bridge-indicator__dot {
  background: #555;
}

/* waiting */
.bridge-indicator[data-status="waiting"] {
  background: rgba(251, 191, 36, 0.08);
  border-color: rgba(251, 191, 36, 0.25);
  color: #fbbf24;
}
.bridge-indicator[data-status="waiting"] .bridge-indicator__dot {
  background: #fbbf24;
  animation: pulse 1.2s ease-in-out infinite;
}

/* connected */
.bridge-indicator[data-status="connected"] {
  background: rgba(52, 211, 153, 0.08);
  border-color: rgba(52, 211, 153, 0.25);
  color: #34d399;
}
.bridge-indicator[data-status="connected"] .bridge-indicator__dot {
  background: #34d399;
  animation: pulse 2s ease-in-out infinite;
}

/* stopped */
.bridge-indicator[data-status="stopped"] {
  background: rgba(248, 113, 113, 0.08);
  border-color: rgba(248, 113, 113, 0.2);
  color: #f87171;
}
.bridge-indicator[data-status="stopped"] .bridge-indicator__dot {
  background: #f87171;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.85); }
}
</style>
