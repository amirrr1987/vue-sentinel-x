# Vue Sentinel X

A dev tool for **Vue 3 + Vite** projects. It helps you find problems in your app:

- Which components are connected to each other
- Memory leaks (listeners/timers not cleaned up)
- Slow components
- Plain-language suggestions

Think of it like a **health check** for your Vue app while you develop.

---

## Who is this for?

You already know:

- Vue 3 basics (`createApp`, components, `script setup`)
- How to run `npm run dev` in a Vite project

You do **not** need to know advanced tooling. Just copy the steps below.

---

## What you need

| Requirement | Why |
|-------------|-----|
| **Vue 3** project | This tool is built for Vue 3 |
| **Vite** | Uses a Vite plugin for file analysis |
| **Node.js 18+** | To install and run the dev server |

Works with projects created by:

```bash
npm create vue@latest
```

---

## Install (one package)

Open your project folder in the terminal and run:

```bash
npm install -D vue-sentinel-x
```

Or with Bun:

```bash
bun add -D vue-sentinel-x
```

> Use version **0.1.1** or newer. Older versions may fail to install dependencies.

That is the only package you need to add. Everything else is installed automatically.

---

## Setup in 2 files

You only change **two files** in your project.

### Step 1 — `vite.config.ts`

Open `vite.config.ts` and add the Sentinel plugin.

**Before:**

```ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
});
```

**After:**

```ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { vueSentinelX } from "vue-sentinel-x/vite";

export default defineConfig({
  plugins: [
    vue(),
    vueSentinelX({
      enabled: true,
      reports: {
        json: true,
        html: true,
        outputDir: "analysis",
      },
      performance: {
        quiet: true,
      },
    }),
  ],
});
```

**What this does:** While Vite runs, it reads your `.vue` files and writes reports into an `analysis/` folder.

---

### Step 2 — `src/main.ts`

Open `src/main.ts` and add the runtime plugin.

**Before:**

```ts
import { createApp } from "vue";
import App from "./App.vue";

createApp(App).mount("#app");
```

**After:**

```ts
import { createApp } from "vue";
import App from "./App.vue";
import { createRuntime } from "vue-sentinel-x/runtime";

const { plugin } = createRuntime({
  enabled: true,
  features: {
    memory: true,
    performance: true,
  },
  performance: { quiet: true },
});

createApp(App).use(plugin).mount("#app");
```

**What this does:** In the browser, it watches memory and performance while you use the app.

---

### Step 3 — Ignore report files (recommended)

Add this line to your `.gitignore`:

```
analysis/
```

These files are for local debugging. You usually do not commit them.

---

## Run your app

```bash
npm run dev
```

Open the app in the browser (usually `http://localhost:5173`).

Click around your app — open pages, mount/unmount components.

---

## See the results

### A) Report files (in your project folder)

After `npm run dev` or `npm run build`, check the `analysis/` folder:

| File | What it is |
|------|------------|
| `component-graph.json` | Map of which components use which |
| `sentinel-report.json` | Full report with issues |
| `sentinel-report.html` | Same report, open in browser |

**Tip:** Double-click `sentinel-report.html` to read issues in a friendly format.

---

### B) Live snapshot (in browser DevTools)

1. Open your app in Chrome / Edge / Firefox
2. Press **F12** → go to **Console**
3. Paste and run:

```js
window.__VUE_SENTINEL_X__.captureSnapshot()
```

You get a live object with memory and performance data for the current page.

---

## Only run in development (recommended)

You usually want Sentinel **only while coding**, not in production.

### `vite.config.ts`

```ts
vueSentinelX({
  enabled: import.meta.env.DEV,
})
```

### `src/main.ts`

```ts
const { plugin } = createRuntime({
  enabled: import.meta.env.DEV,
});
```

`import.meta.env.DEV` is `true` when you run `npm run dev`, and `false` when you build for production.

---

## Minimal config (if you want less noise)

```ts
// vite.config.ts
vueSentinelX({
  enabled: import.meta.env.DEV,
  reports: { json: true, html: false, outputDir: "analysis" },
  performance: { quiet: true },
});

// main.ts
createRuntime({
  enabled: import.meta.env.DEV,
  features: { memory: true, performance: true },
  performance: { quiet: true },
});
```

---

## Imports cheat sheet

| You need | Import from |
|----------|-------------|
| Vite plugin | `import { vueSentinelX } from "vue-sentinel-x/vite"` |
| Runtime plugin | `import { createRuntime } from "vue-sentinel-x/runtime"` |
| Advanced / rules API | `import { intelligenceEngine } from "vue-sentinel-x/core"` |
| Everything | `import { vueSentinelX, createRuntime } from "vue-sentinel-x"` |

---

## Common problems

### `404` for `@amirrr1987/vue-sentinel-x-...`

You are on an old `vue-sentinel-x` version. Update:

```bash
npm install -D vue-sentinel-x@latest
```

### No `analysis/` folder

1. Make sure `vueSentinelX({ enabled: true })` is in `vite.config.ts`
2. Restart dev server: stop it (`Ctrl+C`) and run `npm run dev` again
3. Make sure your project has at least one `.vue` file

### `window.__VUE_SENTINEL_X__` is undefined

1. Check `createRuntime` is in `main.ts` and `enabled` is `true`
2. Hard refresh the page (`Ctrl+Shift+R`)
3. Make sure you are not in production build with `enabled: import.meta.env.DEV`

### TypeScript errors on import

Your project should already have TypeScript types from the package. If not, restart your editor (VS Code: `Ctrl+Shift+P` → “Reload Window”).

---

## What gets checked?

| Area | Example issue |
|------|----------------|
| **Component graph** | Very large components, tangled dependencies |
| **Memory** | `setInterval` or `addEventListener` not removed on unmount |
| **Performance** | Slow mount/update, long main-thread tasks |
| **Intelligence** | Short explanation + suggestion for each issue |

---

## Optional: main settings

| Option | Default | Meaning |
|--------|---------|---------|
| `enabled` | `true` | Turn everything on/off |
| `features.graph` | `true` | Build component graph |
| `features.memory` | `true` | Detect memory leaks |
| `features.performance` | `true` | Track slow components |
| `features.intelligence` | `true` | Analyze and explain issues |
| `reports.json` | `true` | Write `sentinel-report.json` |
| `reports.html` | `false` | Write `sentinel-report.html` |
| `performance.quiet` | `true` | Less log noise in terminal |

Turn off quickly:

```ts
vueSentinelX({ enabled: false });
createRuntime({ enabled: false });
```

---

## Full example project structure

After setup, the important parts look like this:

```
my-vue-app/
├── vite.config.ts      ← add vueSentinelX here
├── src/
│   └── main.ts         ← add createRuntime here
├── analysis/           ← reports appear here (auto-generated)
│   ├── component-graph.json
│   ├── sentinel-report.json
│   └── sentinel-report.html
└── package.json        ← vue-sentinel-x in devDependencies
```

---

## Links

- npm: [vue-sentinel-x](https://www.npmjs.com/package/vue-sentinel-x)
- GitHub: [amirrr1987/vue-sentinel-x](https://github.com/amirrr1987/vue-sentinel-x)
- Issues: [Report a bug](https://github.com/amirrr1987/vue-sentinel-x/issues)

---

## License

MIT
