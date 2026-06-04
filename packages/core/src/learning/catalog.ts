import type { LearningLesson } from "./types.js";

const lessons: Record<string, LearningLesson> = {
  "memory-listeners-remain": {
    whatItIs:
      "An event listener is a function the browser calls when something happens (click, scroll, keypress). You attach it with `addEventListener`.",
    whyItsAProblem:
      "If you forget to remove it when the component is destroyed, the browser keeps your function — and often your component data — in memory forever.",
    howToFix:
      "1. Register the listener in `onMounted`.\n2. Remove the same listener in `onUnmounted`.\n3. Use the same function reference for both calls.",
    badExample: {
      label: "Listener added, never removed",
      language: "vue",
      code: `<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

function handleResize() {
  // uses component state...
}
</script>`,
    },
    goodExample: {
      label: "Paired add + remove",
      language: "vue",
      code: `<script setup>
import { onMounted, onUnmounted } from 'vue'

function handleResize() {
  // uses component state...
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>`,
    },
  },

  "memory-timers-remain": {
    whatItIs:
      "`setTimeout` runs code once after a delay. `setInterval` runs it again and again. Both return an id you use to cancel them.",
    whyItsAProblem:
      "A timer that outlives your component can still run and touch old state — causing bugs and memory leaks.",
    howToFix:
      "1. Save the timer id when you create it.\n2. Call `clearTimeout` or `clearInterval` in `onUnmounted`.",
    badExample: {
      language: "vue",
      code: `<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  setInterval(() => {
    refreshData() // component may be gone!
  }, 1000)
})
</script>`,
    },
    goodExample: {
      language: "vue",
      code: `<script setup>
import { onMounted, onUnmounted } from 'vue'

let intervalId: ReturnType<typeof setInterval>

onMounted(() => {
  intervalId = setInterval(refreshData, 1000)
})

onUnmounted(() => {
  clearInterval(intervalId)
})
</script>`,
    },
  },

  "memory-watchers-remain": {
    whatItIs:
      "A watcher (`watch` or `watchEffect`) runs code whenever reactive data changes. Manual watchers return a `stop` function.",
    whyItsAProblem:
      "If the watcher keeps running after the component is gone, it may update state that no longer exists and hold references in memory.",
    howToFix:
      "Call `stop()` in `onUnmounted`, or create watchers during `setup` so Vue cleans them up automatically.",
    badExample: {
      language: "vue",
      code: `<script setup>
import { watch } from 'vue'

const stop = watch(source, () => {
  doSomething()
})
// never calls stop() — leak if component unmounts
</script>`,
    },
    goodExample: {
      language: "vue",
      code: `<script setup>
import { watch, onUnmounted } from 'vue'

const stop = watch(source, () => {
  doSomething()
})

onUnmounted(() => stop())
</script>`,
    },
  },

  "memory-heap-growth": {
    whatItIs:
      "Browser memory (the JS heap) is where your objects live. `performance.memory` shows how much is used (Chromium only).",
    whyItsAProblem:
      "Memory that never goes down while you open and close the same screen often means data is accumulating — users get slow tabs or crashes.",
    howToFix:
      "1. Clear large arrays/maps when leaving the page.\n2. Avoid storing every API response in a global object.\n3. Use DevTools → Memory to take heap snapshots and compare.",
    badExample: {
      language: "javascript",
      code: `const cache = []

export function savePageData(data) {
  cache.push(data) // grows forever
}`,
    },
    goodExample: {
      language: "vue",
      code: `<script setup>
import { onUnmounted, ref } from 'vue'

const rows = ref([])

onUnmounted(() => {
  rows.value = [] // release large table data
})
</script>`,
    },
  },

  "memory-leak-detected": {
    whatItIs:
      "A memory leak means your app keeps objects in RAM after you navigate away — listeners, timers, or watchers are common causes.",
    whyItsAProblem:
      "Leaks add up as users click around. The app feels slower over time and may crash on phones with less memory.",
    howToFix:
      "Add an `onUnmounted` cleanup block: remove listeners, clear timers, stop watchers. Treat cleanup as required, not optional.",
    badExample: {
      language: "vue",
      code: `<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  window.addEventListener('scroll', onScroll)
  setInterval(poll, 5000)
})
// no onUnmounted — leak
</script>`,
    },
    goodExample: {
      language: "vue",
      code: `<script setup>
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  window.addEventListener('scroll', onScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  clearInterval(pollId)
})
</script>`,
    },
  },

  "watchers-not-stopped": {
    whatItIs:
      "Same as a watcher that was started manually but not stopped when the component was destroyed.",
    whyItsAProblem:
      "It can throw errors (updating unmounted component) and wastes CPU on work nobody sees.",
    howToFix:
      "Always pair `watch()` with `stop()` in `onUnmounted`, or rely on watchers created in `setup` without storing them globally.",
    badExample: {
      language: "vue",
      code: `watch(route, () => fetchList()) // never stopped`,
    },
    goodExample: {
      language: "vue",
      code: `const stop = watch(route, () => fetchList())
onUnmounted(stop)`,
    },
  },

  "watcher-update-storm": {
    whatItIs:
      "An update storm is when a component re-renders far too often — often because a watcher or reactive dependency fires on every tiny change.",
    whyItsAProblem:
      "Each re-render uses CPU. Hundreds per second make typing, scrolling, and animations feel stuck.",
    howToFix:
      "1. Watch a single field, not a whole object.\n2. Prefer `computed` for derived values.\n3. Debounce expensive handlers.",
    badExample: {
      language: "vue",
      code: `watch(bigState, () => {
  localCopy.value = JSON.parse(JSON.stringify(bigState))
})`,
    },
    goodExample: {
      language: "vue",
      code: `watch(() => bigState.userId, (id) => {
  if (id) fetchUser(id)
})

const fullName = computed(() =>
  user.first + ' ' + user.last
)`,
    },
  },

  "slow-watcher-updates": {
    whatItIs:
      "Each time reactive data changes, Vue may re-run render and your watcher callbacks. Slow callbacks block the main thread.",
    whyItsAProblem:
      "The browser cannot paint or respond to clicks while heavy JavaScript runs — users perceive this as lag.",
    howToFix:
      "Move heavy work out of watchers (async fetch, worker, or chunked processing). Keep watchers thin.",
    badExample: {
      language: "vue",
      code: `watch(items, () => {
  sorted.value = items.value.slice().sort(heavyCompare)
})`,
    },
    goodExample: {
      language: "vue",
      code: `const sorted = computed(() =>
  [...items.value].sort(heavyCompare)
)`,
    },
  },

  "deep-watch-smell": {
    whatItIs:
      "A deep watch tracks every nested property inside an object. Vue must visit the whole tree on each change.",
    whyItsAProblem:
      "Large objects + deep watching = lots of work for small edits (like changing one field).",
    howToFix:
      "Watch specific keys, use `shallowRef` for big data, or split UI into smaller child components.",
    badExample: {
      language: "vue",
      code: `watch(config, () => save(config), { deep: true })`,
    },
    goodExample: {
      language: "vue",
      code: `watch(() => config.theme, () => saveTheme())

const config = shallowRef(loadHugeConfig())`,
    },
  },

  "shared-component-cascade": {
    whatItIs:
      "A shared component is used in many parents (like a `Button` or `Card`). Reactive state inside it can affect every parent tree.",
    whyItsAProblem:
      "One update inside a shared child can trigger re-renders in many places at once.",
    howToFix:
      "Keep shared components mostly presentational: pass data in with props, emit events out. Put shared mutable state in a focused store slice.",
    badExample: {
      language: "vue",
      code: `<!-- SharedCard.vue -->
<script setup>
const list = ref([]) // every parent pays for updates
</script>`,
    },
    goodExample: {
      language: "vue",
      code: `<!-- SharedCard.vue -->
<script setup>
defineProps<{ title: string }>()
defineEmits<{ select: [] }>()
</script>`,
    },
  },

  "frequent-rerender": {
    whatItIs:
      "A re-render is when Vue updates the DOM for a component because reactive data changed.",
    whyItsAProblem:
      "Too many re-renders mean you are doing the same work repeatedly — often from recreating objects or watching too much.",
    howToFix:
      "Stabilize props (avoid inline `{}` in templates). Use `computed` instead of copying state in watchers. Split hot UI into child components.",
    badExample: {
      language: "vue",
      code: `<Child :options="{ sort: true }" />
<!-- new object every render → Child always updates -->`,
    },
    goodExample: {
      language: "vue",
      code: `<script setup>
const options = { sort: true }
</script>
<template>
  <Child :options="options" />
</template>`,
    },
  },

  "inline-reactive-smell": {
    whatItIs:
      "One `<script setup>` block holds many refs, composables, and child components — a single big reactive zone.",
    whyItsAProblem:
      "Any small change can invalidate a large subtree. Harder to reason about what triggered an update.",
    howToFix:
      "Extract sections into child `.vue` files. Move logic into composables (`useFilters.ts`).",
    badExample: {
      language: "vue",
      code: `<!-- Dashboard.vue — 400 lines, 12 refs, 8 child imports -->`,
    },
    goodExample: {
      language: "vue",
      code: `<!-- Dashboard.vue -->
<template>
  <DashboardHeader />
  <DashboardStats />
  <DashboardTable />
</template>`,
    },
  },

  "long-task-reactivity": {
    whatItIs:
      "A long task is any piece of JavaScript that blocks the main thread for about 50 ms or more (browser definition).",
    whyItsAProblem:
      "While blocked, the page cannot animate or handle input — it feels frozen.",
    howToFix:
      "Break big loops into chunks (`requestAnimationFrame`), move work off-thread, or reduce reactive work during interactions.",
    badExample: {
      language: "javascript",
      code: `function onInput() {
  for (let i = 0; i < 500_000; i++) process(i)
}`,
    },
    goodExample: {
      language: "javascript",
      code: `function onInput() {
  queueMicrotask(() => processLightweight())
  // or debounce heavy work
}`,
    },
  },

  "large-component-children": {
    whatItIs:
      "A large component file composes many child components directly in one template or script.",
    whyItsAProblem:
      "Hard to read, test, and optimize. One change can re-render a huge tree.",
    howToFix:
      "Split by UI region. Each region gets its own `.vue` file with a clear name.",
    badExample: {
      language: "vue",
      code: `<template>
  <!-- 15 imports used inline in one page -->
  <Header /><Nav /><Filters /><Table />...
</template>`,
    },
    goodExample: {
      language: "vue",
      code: `<template>
  <PageShell>
    <PageFilters />
    <PageTable />
  </PageShell>
</template>`,
    },
  },

  "large-component-imports": {
    whatItIs:
      "Your script imports many `.vue` files — a sign the parent orchestrates too much UI.",
    whyItsAProblem:
      "More imports mean more code to parse and a wider re-render scope.",
    howToFix:
      "Group related imports into one section component (e.g. `SettingsPanel.vue`).",
    badExample: {
      language: "vue",
      code: `import A from './A.vue'
import B from './B.vue'
// ... 12 more`,
    },
    goodExample: {
      language: "vue",
      code: `import SettingsPanel from './SettingsPanel.vue'`,
    },
  },

  "large-component-slow-mount": {
    whatItIs:
      "Mount time is how long it takes from creating the component to finishing its first render in the DOM.",
    whyItsAProblem:
      "Slow mounts delay what users see — especially on first visit or slow devices.",
    howToFix:
      "Lazy-load heavy children, defer non-critical API calls, shrink the initial template.",
    badExample: {
      language: "vue",
      code: `<script setup>
const data = await fetchHugeList() // blocks mount
</script>`,
    },
    goodExample: {
      language: "vue",
      code: `<script setup>
import { onMounted, ref } from 'vue'
const data = ref([])

onMounted(async () => {
  data.value = await fetchHugeList()
})
</script>`,
    },
  },

  "large-component-combined": {
    whatItIs:
      "An oversized component is both structurally large (many children/imports) and expensive to mount or update.",
    whyItsAProblem:
      "It becomes a bottleneck for performance and team velocity — everyone fears touching the file.",
    howToFix:
      "Refactor in small steps: extract one panel at a time, move logic to composables, keep the page component thin.",
    badExample: {
      language: "vue",
      code: `<!-- AppPage.vue: 600 lines, 14 imports, API + table + modals -->`,
    },
    goodExample: {
      language: "vue",
      code: `<!-- AppPage.vue -->
<script setup>
import AppLayout from './AppLayout.vue'
</script>
<template>
  <AppLayout />
</template>`,
    },
  },
};

const fallbackLesson: LearningLesson = {
  whatItIs: "A pattern in your Vue app that our rules flagged as risky or slow.",
  whyItsAProblem:
    "It can hurt performance, cause bugs after navigation, or make the codebase harder to maintain.",
  howToFix:
    "Read the suggestion on this finding, try the good example pattern, and re-run your app to confirm the warning is gone.",
  badExample: {
    code: "// Pattern unclear — inspect the component named in the finding",
    language: "javascript",
  },
  goodExample: {
    code: "// Apply the suggestion step by step and keep components small",
    language: "javascript",
  },
};

export function getLearningLesson(ruleId: string): LearningLesson {
  return lessons[ruleId] ?? fallbackLesson;
}

export function getAllLearningRuleIds(): string[] {
  return Object.keys(lessons);
}
