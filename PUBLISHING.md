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

### 2b. Two-factor authentication (required for publish)

npm often returns **403** with:

> Two-factor authentication or granular access token with bypass 2fa enabled is required to publish packages.

**Fix (choose one):**

1. **Enable 2FA on npm**  
   [npmjs.com](https://www.npmjs.com) → Account → **Enable 2FA** → choose **Authorization and publishing** (or both).

2. **Publish with a one-time password** (after 2FA is on):

   ```bash
   npm publish -w @vue-sentinel-x/core --access public --otp=123456
   ```

   Replace `123456` with the current code from your authenticator app.

3. **Or use a Granular Access Token** (for CI / automation):  
   Account → Access Tokens → Generate New Token → **Granular Access Token**  
   - Permissions: Read and write packages  
   - Enable **bypass 2FA for publish** (if shown)  
   - Publish with: `npm config set //registry.npmjs.org/:_authToken=YOUR_TOKEN`

   Do not commit tokens to git.

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

## CI publish (GitHub Actions)

Workflow: [`.github/workflows/publish.yml`](./.github/workflows/publish.yml)

- Runs on **git tags** `v*` (e.g. `v0.0.1`) or **workflow_dispatch** (manual).
- Does **not** publish on every push to `main`.

### Setup

1. Create an npm **Granular Access Token** with **Read and write** on packages.
2. Enable **Bypass 2FA for automation** (required if your account has 2FA).
3. In GitHub repo → **Settings → Secrets and variables → Actions** → New secret:
   - Name: `NPM_TOKEN`
   - Value: your token (`npm_...`)

### Release via tag

```bash
git tag v0.0.1
git push origin v0.0.1
```

The workflow builds with Bun, then publishes `core` → `runtime` → `vite-plugin` to npm.

---

## Packages not on npm

| Package | Reason |
|---------|--------|
| `vue-sentinel-x` (root) | Monorepo root, `private: true` |
| `@vue-sentinel-x/dashboard` | Dev UI only, `private: true` |
