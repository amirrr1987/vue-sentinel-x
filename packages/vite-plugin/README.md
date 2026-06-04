# @vue-sentinel-x/vite-plugin

Vite plugin that analyzes `.vue` files and writes component graphs and reports.

```bash
npm install -D @vue-sentinel-x/vite-plugin
```

```ts
import { vueSentinelX } from "@vue-sentinel-x/vite-plugin";

export default defineConfig({
  plugins: [
    vue(),
    vueSentinelX({
      reports: { json: true, html: true },
    }),
  ],
});
```

Peer dependency: `vite` ^5.4 || ^6 || ^7

See the [main README](https://github.com/amirrr1987/vue-sentinel-x#readme).
