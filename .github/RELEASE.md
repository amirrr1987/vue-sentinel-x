# Release Process

## چطور release کنیم

### 1. bump کردن version

```bash
# patch: 0.1.0 → 0.1.1
bun run version:patch

# minor: 0.1.0 → 0.2.0
bun run version:minor

# major: 0.1.0 → 1.0.0
bun run version:major
```

این اسکریپت:
- version همه پکیج‌ها رو sync می‌کنه
- وابستگی‌های داخلی (`@vue-sentinel-x/*`) رو آپدیت می‌کنه

### 2. CHANGELOG.md رو آپدیت کن

یه section جدید بالای فایل اضافه کن:

```markdown
## [0.2.0] - YYYY-MM-DD

### Added
- ...

### Fixed
- ...
```

### 3. commit + tag + push

```bash
git add -A
git commit -m "chore: release v0.2.0"
git tag v0.2.0
git push origin main --tags
```

### 4. GitHub Actions بقیه رو خودکار انجام می‌ده

| Job | کار |
|-----|-----|
| `validate` | تأیید می‌کند tag با package.json match دارد |
| `build` | typecheck + build + verify dist files |
| `publish` | هر پکیج رو به npm منتشر می‌کند (با provenance) |
| `release` | GitHub Release با changelog extract می‌سازد |

---

## Pre-release

```bash
# نسخه beta
bun run version:patch   # → 0.1.1
# دستی package.json رو ویرایش کن: "0.1.1-beta.0"
git tag v0.1.1-beta.0
git push origin main --tags
```

پکیج با tag `next` منتشر می‌شه (نه `latest`).

---

## Secret های لازم در GitHub

| Secret | توضیح |
|--------|-------|
| `NPM_TOKEN` | از npmjs.com → Access Tokens → Granular (Automation type) بساز |

مسیر در GitHub: `Settings → Secrets and variables → Actions → New repository secret`

---

## Environment: `npm-publish`

در workflow از `environment: npm-publish` استفاده شده. برای فعال کردن:

`Settings → Environments → New environment → npm-publish`

می‌تونی Required reviewers اضافه کنی تا قبل از publish تأیید دستی لازم باشه.
