# Live Bridge — راهنمای استفاده

## چطور کار می‌کنه؟

```
اپ Vue شما                    Dashboard (localhost:5174)
─────────────────             ──────────────────────────
createLiveBridge()  ────────► useLiveBridge()
  هر ۱ ثانیه         BroadcastChannel    real-time update
  snapshot می‌فرسته  (همان origin)       memory / perf / lifecycle
```

از `BroadcastChannel` استفاده می‌شه — بدون WebSocket، بدون server جانبی.
فقط کافیه **اپ و dashboard در همان origin** باز باشن (مثلاً هر دو روی `localhost`).

---

## ۱. نصب در اپ Vue شما

```bash
bun add @amirrr1987/vue-sentinel-x-runtime
```

## ۲. تنظیم `main.ts`

```ts
import { createApp } from "vue";
import App from "./App.vue";
import { createRuntime, createLiveBridge } from "@amirrr1987/vue-sentinel-x-runtime";

// Runtime plugin (lifecycle + memory + performance tracking)
const { plugin } = createRuntime({
  enabled: true,
  features: {
    runtime: true,
    memory: true,
    performance: true,
  },
});

// Live bridge — هر ۱ ثانیه snapshot به dashboard می‌فرسته
const bridge = createLiveBridge({ intervalMs: 1000 });
bridge.start();

createApp(App).use(plugin).mount("#app");
```

## ۳. راه‌اندازی dashboard

از ریشه monorepo:

```bash
bun run dashboard:dev
```

Dashboard روی `http://localhost:5174` باز می‌شه.

## ۴. باز کردن هر دو تب

| تب | آدرس |
|----|------|
| اپ شما | `http://localhost:5173` (یا هر پورت Vite) |
| Dashboard | `http://localhost:5174` |

وقتی هر دو در مرورگر باز باشن، dashboard به صورت **real-time** آپدیت می‌شه:
- 🟢 **Live** — داده زنده دریافت می‌شه
- 🟡 **Waiting** — منتظر اپ
- 🔴 **App closed** — تب اپ بسته شده

---

## گزینه‌های LiveBridge

```ts
createLiveBridge({
  intervalMs: 1000,   // فاصله ارسال snapshot (ms) — پیش‌فرض: 1000
  autoStart: true,    // شروع خودکار — پیش‌فرض: true
});
```

## متدها

```ts
const bridge = createLiveBridge({ autoStart: false });

bridge.start();   // شروع ارسال
bridge.stop();    // توقف
bridge.flush();   // ارسال فوری یک snapshot (مثلاً بعد از یک action)
```

---

## محدودیت‌ها

- **فقط همان origin**: `BroadcastChannel` فقط بین تب‌های همان origin کار می‌کنه (مثلاً هر دو `localhost`، نه یکی `localhost` و دیگری `192.168.x.x`).
- **فقط در مرورگر**: در SSR/Node کار نمی‌کنه (خودش تشخیص می‌ده و skip می‌کنه).
- **داده‌های runtime**: bridge فقط memory/performance/lifecycle می‌فرسته — گراف کامپوننت‌ها از vite plugin میاد.
