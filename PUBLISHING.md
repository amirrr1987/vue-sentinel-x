# Publishing to npm

This guide covers publishing **`@vue-sentinel-x/core`**, **`@vue-sentinel-x/runtime`**, and **`@vue-sentinel-x/vite-plugin`**.

The root repo and **`@vue-sentinel-x/dashboard`** stay **private** (not published).

## What you must do (checklist)

### 1. npm account and scope

- Create an account at [https://www.npmjs.com/signup](https://www.npmjs.com/signup)
- **Option A (recommended):** Create an npm **organization** named `vue-sentinel-x`  
  → Settings → Organizations → Create  
  → Then you can publish `@vue-sentinel-x/core`, etc.
- **Option B:** If the org name is taken, use your scope (e.g. `@yourname/vue-sentinel-x-core`) and rename packages in each `package.json` before publish.

### 2. Log in locally

```bash
npm login
npm whoami
```

### 3. Build

```bash
bun install
bun run build
node scripts/prepare-publish.mjs
```

### 4. Publish in order (dependencies matter)

```bash
npm publish -w @vue-sentinel-x/core --access public
npm publish -w @vue-sentinel-x/runtime --access public
npm publish -w @vue-sentinel-x/vite-plugin --access public
```

If `npm publish -w` is not available, publish from each folder:

```bash
cd packages/core && npm publish --access public && cd ../..
cd packages/runtime && npm publish --access public && cd ../..
cd packages/vite-plugin && npm publish --access public && cd ../..
```

### 5. Git tag (optional)

```bash
git tag v0.0.1
git push origin v0.0.1
```

Create a GitHub Release from the tag and paste `CHANGELOG.md`.

### 6. Verify install in a fresh app

```bash
mkdir test-app && cd test-app
npm init -y
npm install -D @vue-sentinel-x/vite-plugin
npm install @vue-sentinel-x/runtime
```

---

## Version bumps (next releases)

1. Update version in **all three** publishable `package.json` files (keep them in sync).
2. Update `dependencies` on `@vue-sentinel-x/core` to the new range (e.g. `^0.0.2`).
3. Update `CHANGELOG.md`.
4. `bun run build` → publish in the same order.

Consider [Changesets](https://github.com/changesets/changesets) later for automation.

---

## CI publish (optional)

1. Create an npm **Automation** or **Publish** token.
2. Add `NPM_TOKEN` to GitHub Actions secrets.
3. On release, run build + publish with `NODE_AUTH_TOKEN`.

---

## Packages not on npm

| Package | Reason |
|---------|--------|
| `vue-sentinel-x` (root) | Monorepo root, `private: true` |
| `@vue-sentinel-x/dashboard` | Dev UI only, `private: true` |
