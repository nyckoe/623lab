# CKare Store Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce code-controlled iOS and Android submission assets and verify both apps and web artifacts.

**Architecture:** Keep store material in separate Pro and Care directories with shared policy templates. Generate deterministic vector source assets and required PNG renditions, while documenting owner-only credentials, legal attestations, and console actions.

**Tech Stack:** Expo EAS, Apple App Store Connect, Google Play Console, SVG/PNG assets, Node verification scripts.

## Global Constraints

- Never commit signing keys, API secrets, service-account JSON, certificates, or provisioning profiles.
- Product claims must match the approved specification.
- App listings must disclose that insurance verification is not a payment guarantee and CKare is not emergency dispatch.
- Store answers are review worksheets; the account owner must attest to final production behavior.

---

### Task 1: Brand and app assets

**Files:**
- Create: `store-assets/shared/brand-source.svg`
- Create: `apps/ckare-pro/assets/icon.svg`
- Create: `apps/ckare-pro/assets/adaptive-icon.svg`
- Create: `apps/ckare-pro/assets/splash.svg`
- Create: `apps/ckare-care/assets/icon.svg`
- Create: `apps/ckare-care/assets/adaptive-icon.svg`
- Create: `apps/ckare-care/assets/splash.svg`
- Create: `scripts/generate-store-assets.mjs`
- Create: `tests/store-assets.test.mjs`

**Interfaces:**
- Produces: deterministic source artwork and a script that emits required PNG dimensions when the image converter is available.

- [ ] **Step 1: Write failing asset tests**

Assert every source asset exists, contains no external URL, includes accessible `<title>` text, and uses the approved palette.

- [ ] **Step 2: Verify failure**

Run: `node --test tests/store-assets.test.mjs`  
Expected: FAIL.

- [ ] **Step 3: Implement source artwork and generation script**

Create distinct `P` and `C` CKare marks with safe-zone-aware compositions and output instructions for 1024px icons, adaptive foreground/background, splash, notification, and Play feature graphic.

- [ ] **Step 4: Verify**

Run: `node --test tests/store-assets.test.mjs`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/*/assets store-assets/shared scripts/generate-store-assets.mjs tests/store-assets.test.mjs
git commit -m "feat: add CKare store artwork sources"
```

### Task 2: Store metadata and privacy worksheets

**Files:**
- Create: `store-assets/ckare-pro/apple-listing.md`
- Create: `store-assets/ckare-pro/google-play-listing.md`
- Create: `store-assets/ckare-pro/privacy-worksheet.md`
- Create: `store-assets/ckare-pro/review-notes.md`
- Create: `store-assets/ckare-care/apple-listing.md`
- Create: `store-assets/ckare-care/google-play-listing.md`
- Create: `store-assets/ckare-care/privacy-worksheet.md`
- Create: `store-assets/ckare-care/review-notes.md`
- Create: `store-assets/shared/privacy-policy.md`
- Create: `store-assets/shared/terms-of-use.md`
- Create: `store-assets/shared/support-and-deletion.md`
- Create: `tests/store-copy.test.mjs`

**Interfaces:**
- Produces: complete draft listing copy and truthful data-use guidance for owner attestation.

- [ ] **Step 1: Write failing copy contract tests**

Assert both app folders contain Apple and Google copy, privacy and review files; enforce title/short-description limits and required safety statements.

- [ ] **Step 2: Verify failure**

Run: `node --test tests/store-copy.test.mjs`  
Expected: FAIL.

- [ ] **Step 3: Write all store and policy copy**

Use exact user-facing descriptions, review navigation paths, permission rationale, data categories, retention/deletion behavior, age-rating guidance, and fictional test-account instructions.

- [ ] **Step 4: Verify**

Run: `node --test tests/store-copy.test.mjs`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add store-assets tests/store-copy.test.mjs
git commit -m "docs: add CKare store submission copy"
```

### Task 3: Release checklists and final verification

**Files:**
- Create: `store-assets/ckare-pro/submission-checklist.md`
- Create: `store-assets/ckare-care/submission-checklist.md`
- Create: `store-assets/OWNER_INPUTS.md`
- Create: `STORE_SUBMISSION_README.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: every prior plan deliverable.
- Produces: exact local commands, EAS commands, console sequence, screenshot shot list, and owner-only input inventory.

- [ ] **Step 1: Write release documentation**

Document `npm test`, app type checks, Expo doctor, local app starts, `eas build --platform ios|android`, internal testing, TestFlight, review submission, and rollback/versioning procedures.

- [ ] **Step 2: Run complete automated verification**

Run: `node --test tests/*.test.mjs`  
Expected: all tests PASS.

- [ ] **Step 3: Run build and browser checks**

Run root build/lint where existing dependencies permit, validate both Expo configs, and inspect both HTML files at desktop and mobile widths with no console errors.

- [ ] **Step 4: Record owner-only blockers**

List Apple/Google account identifiers, verified bundle availability, production Supabase/Stripe/RevenueCat keys, legal entity, tax/banking, pricing, payer contracts, privacy contact, support URL, and signing credentials. Do not invent values.

- [ ] **Step 5: Commit**

```bash
git add README.md STORE_SUBMISSION_README.md store-assets
git commit -m "docs: finalize CKare release handoff"
```
