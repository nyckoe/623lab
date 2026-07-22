# CKare Care Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the service-receiver mobile app and corresponding standalone web experience.

**Architecture:** Use an independent Expo Router app importing shared policy and design packages. Build the web artifact as one self-contained HTML file with embedded CSS and JavaScript.

**Tech Stack:** Expo 55, React Native 0.83, Expo Router, TypeScript, standalone HTML/CSS/JavaScript.

## Global Constraints

- Primary navigation is Home, Find Care, Visits, Coverage, Profile.
- Representative/dependent contexts cannot mix records.
- Coverage verification and cost information are timestamped estimates.
- Emergency intent routes away from marketplace booking.
- Preserve unrelated existing worktree changes.

---

### Task 1: CKare Care Expo shell

**Files:**
- Create: `apps/ckare-care/package.json`
- Create: `apps/ckare-care/app.json`
- Create: `apps/ckare-care/eas.json`
- Create: `apps/ckare-care/tsconfig.json`
- Create: `apps/ckare-care/app/_layout.tsx`
- Create: `apps/ckare-care/app/(tabs)/_layout.tsx`
- Create: `apps/ckare-care/src/components/Screen.tsx`
- Create: `apps/ckare-care/src/components/StatusPill.tsx`
- Create: `apps/ckare-care/src/data/demo.ts`
- Create: `tests/care-contract.test.mjs`

**Interfaces:**
- Consumes: `@ckare/core`, `@ckare/design`.
- Produces: five routable tabs and accessible shared components.

- [ ] **Step 1: Write failing configuration tests**

Assert app name `CKare Care`, slug `ckare-care`, scheme `ckarecare`, iOS bundle ID and Android package `com.ckare.care`, and the five route files.

- [ ] **Step 2: Verify failure**

Run: `node --test tests/care-contract.test.mjs`  
Expected: FAIL.

- [ ] **Step 3: Implement app shell**

Configure typed routes, theme, safe-area screens, visible labels, and no unnecessary sensitive-device permissions.

- [ ] **Step 4: Verify**

Run: `node --test tests/care-contract.test.mjs`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/ckare-care tests/care-contract.test.mjs
git commit -m "feat: scaffold CKare Care mobile app"
```

### Task 2: CKare Care feature screens

**Files:**
- Create: `apps/ckare-care/app/(tabs)/index.tsx`
- Create: `apps/ckare-care/app/(tabs)/find-care.tsx`
- Create: `apps/ckare-care/app/(tabs)/visits.tsx`
- Create: `apps/ckare-care/app/(tabs)/coverage.tsx`
- Create: `apps/ckare-care/app/(tabs)/profile.tsx`
- Modify: `apps/ckare-care/src/data/demo.ts`
- Modify: `tests/care-contract.test.mjs`

**Interfaces:**
- Produces: active-person context, coverage readiness, matching, provider detail, booking review, visits, and representative controls.

- [ ] **Step 1: Add failing safety and workflow tests**

Assert required screens include emergency routing, separate coverage statuses, estimated-cost disclosure, representative context, cancellation terms, and provider credential details.

- [ ] **Step 2: Verify failure**

Run: `node --test tests/care-contract.test.mjs`  
Expected: FAIL for missing screens.

- [ ] **Step 3: Implement all five screens**

Use fictional data, clear person context, non-color status cues, and rule-derived readiness from `@ckare/core`.

- [ ] **Step 4: Verify**

Run: `node --test tests/care-contract.test.mjs`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/ckare-care tests/care-contract.test.mjs
git commit -m "feat: build CKare Care workflows"
```

### Task 3: CKare Care standalone web experience

**Files:**
- Create: `web/ckare-care.html`
- Create: `tests/web-care.test.mjs`

**Interfaces:**
- Produces: direct-open responsive HTML with person switching, care matching, booking demo, and staged coverage readiness.

- [ ] **Step 1: Write failing HTML contract tests**

Assert one `main`, five navigation controls, viewport metadata, skip link, reduced-motion CSS, responsive breakpoint, emergency language, and insurance-estimate disclaimer.

- [ ] **Step 2: Verify failure**

Run: `node --test tests/web-care.test.mjs`  
Expected: FAIL.

- [ ] **Step 3: Implement the self-contained experience**

Embed Quiet Confidence CSS and dependency-free JavaScript. Include functional navigation, dependent switching, filters, provider selection, booking review, and coverage status expansion.

- [ ] **Step 4: Verify**

Run: `node --test tests/web-care.test.mjs`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add web/ckare-care.html tests/web-care.test.mjs
git commit -m "feat: add CKare Care web experience"
```

