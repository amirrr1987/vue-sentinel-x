# Release (ساده)

## ۱. GitHub Actions (بدون OTP هر بار)

GitHub → **Settings → Secrets → Actions** → `NPM_TOKEN`

از [npmjs.com](https://www.npmjs.com) → **Access Tokens** → **Granular**:

- Read and write
- scope `@amirrr1987`
- **Bypass 2FA for publish** ✅

```bash
git tag v0.1.0
git push origin v0.1.0
```

یا **Actions → Publish → Run workflow**

---

## ۲. انتشار دستی از لوکال

### روش A — با OTP (۶ رقم از authenticator)

`--otp` باید **فقط عدد ۶ رقمی** باشد (مثلاً `847291`).  
**نه** `XXXXXX` و نه متن placeholder از مستندات.

```bash
npm login
bun run build

# کد فعلی از Google Authenticator / Authy را بگذارید:
npm publish -w vue-sentinel-x-core --access public --otp=847291
npm publish -w vue-sentinel-x-runtime --access public --otp=847291
npm publish -w vue-sentinel-x-vite-plugin --access public --otp=847291
```

هر دستور OTP جدید می‌خواهد (کد هر ~۳۰ ثانیه عوض می‌شود).

### روش B — بدون OTP (توکن در npm config)

```bash
npm login
# یا: npm config set //registry.npmjs.org/:_authToken=npm_xxxxxxxx
bun run build
npm publish -w vue-sentinel-x-core --access public
npm publish -w vue-sentinel-x-runtime --access public
npm publish -w vue-sentinel-x-vite-plugin --access public
```

---

## bump نسخه

```bash
bun run version:patch
git commit -am "chore: release v0.1.1"
git tag v0.1.1
git push origin main --tags
```
