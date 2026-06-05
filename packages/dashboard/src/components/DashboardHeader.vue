<script setup lang="ts">
import LiveBridgeIndicator from "./LiveBridgeIndicator.vue";
import type { BridgeStatus } from "../composables/useLiveBridge.js";

defineProps<{
  projectRoot: string;
  source: string;
  generatedAt: string;
  issueCount: number;
  bridgeStatus: BridgeStatus;
  snapshotCount: number;
  lastUpdated: number | null;
}>();
</script>

<template>
  <header class="header">
    <div>
      <h1 class="header__title">Vue Sentinel X</h1>
      <p class="header__sub">
        {{ projectRoot }}
        <span class="header__dot">·</span>
        {{ source }} data
        <span class="header__dot">·</span>
        {{ new Date(generatedAt).toLocaleString() }}
      </p>
    </div>
    <div class="header__right">
      <LiveBridgeIndicator
        :status="bridgeStatus"
        :snapshot-count="snapshotCount"
        :last-updated="lastUpdated"
      />
      <div class="header__pill">
        {{ issueCount }} {{ issueCount === 1 ? "issue" : "issues" }}
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}

.header__title {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
}

.header__sub {
  margin: 0.25rem 0 0;
  font-size: 0.8rem;
  color: var(--muted);
}

.header__dot {
  opacity: 0.5;
}

.header__right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header__pill {
  background: var(--surface-2);
  border: 1px solid var(--border);
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
}
</style>
