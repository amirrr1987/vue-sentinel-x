<script setup lang="ts">
import type { RuleFinding, RuleSeverity } from "@vue-sentinel-x/core";

defineProps<{
  summary: string;
  findings: RuleFinding[];
}>();

function severityClass(severity: RuleSeverity): string {
  return `issue--${severity}`;
}

function severityLabel(severity: RuleSeverity): string {
  if (severity === "error") {
    return "Issue";
  }
  if (severity === "warning") {
    return "Warning";
  }
  return "Tip";
}
</script>

<template>
  <section class="panel panel--issues">
    <h2 class="panel__title">Issues</h2>
    <p class="panel__hint">{{ summary }}</p>

    <ul v-if="findings.length" class="issues-list">
      <li
        v-for="(finding, index) in findings"
        :key="`${finding.ruleId}-${index}`"
        class="issue"
        :class="severityClass(finding.severity)"
      >
        <div class="issue__head">
          <span class="badge" :class="`badge--${finding.severity}`">
            {{ severityLabel(finding.severity) }}
          </span>
          <h3 class="issue__title">
            {{ finding.component ?? "Project" }}
          </h3>
        </div>
        <p class="issue__problem">{{ finding.problem }}</p>
        <p class="issue__suggestion">{{ finding.suggestion }}</p>
      </li>
    </ul>

    <p v-else class="panel__hint">No issues — great job!</p>
  </section>
</template>

<style scoped>
.panel--issues {
  grid-column: 1 / -1;
}
</style>
