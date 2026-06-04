# @vue-sentinel-x/runtime

Vue 3 plugin for component lifecycle, memory leak hints, and performance metrics.

```bash
npm install @vue-sentinel-x/runtime
```

```ts
import { createApp } from "vue";
import { createRuntime } from "@vue-sentinel-x/runtime";

const { plugin } = createRuntime({
  features: { memory: true, performance: true },
});

createApp(App).use(plugin).mount("#app");
```

Peer dependency: `vue` ^3.4.0

See the [main README](https://github.com/amirrr1987/vue-sentinel-x#readme).
