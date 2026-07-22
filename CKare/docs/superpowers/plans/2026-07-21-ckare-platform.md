# CKare Shared Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the shared monorepo foundation, domain rules, database contract, and tests used by CKare Pro and CKare Care.

**Architecture:** Keep the existing web prototype intact while adding npm workspaces for two Expo apps and two shared packages. Put pure policy logic in `packages/core` and enforce the same state boundaries in Supabase SQL.

**Tech Stack:** TypeScript 5.9, npm workspaces, Node test runner, Supabase PostgreSQL, Expo 55, React Native 0.83.

## Global Constraints

- Bundle IDs are `com.ckare.pro` and `com.ckare.care`, subject to owner availability confirmation before signing.
- Clients cannot promote provider activation or insurance readiness without authorized server state.
- No license, payer reimbursement, or emergency-dispatch guarantee.
- Web accessibility target is WCAG 2.2 AA.
- Preserve unrelated existing worktree changes.

---

### Task 1: Workspace and shared design tokens

**Files:**
- Modify: `package.json`
- Create: `packages/design/package.json`
- Create: `packages/design/src/tokens.ts`
- Create: `packages/design/src/index.ts`
- Create: `packages/design/tsconfig.json`

**Interfaces:**
- Produces: `colors`, `spacing`, `radius`, `typography`, and `motion` exported from `@ckare/design`.

- [ ] **Step 1: Add workspace assertions**

Create a Node test that imports `packages/design/src/tokens.ts` and asserts `colors.ink`, `colors.paper`, `colors.coral`, and a `44` minimum touch target.

- [ ] **Step 2: Run the test and verify failure**

Run: `node --test tests/shared-platform.test.mjs`  
Expected: FAIL because the token module does not exist.

- [ ] **Step 3: Implement workspace and tokens**

Add root workspaces for `apps/*` and `packages/*`. Export immutable Quiet Confidence tokens with paper `#F7F3EA`, ink `#17342F`, coral `#E86F51`, mint `#D8E9DF`, gold `#E8C66A`, and touch target `44`.

- [ ] **Step 4: Verify**

Run: `node --test tests/shared-platform.test.mjs`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add package.json packages/design tests/shared-platform.test.mjs
git commit -m "feat: add CKare shared design system"
```

### Task 2: Domain status rules

**Files:**
- Create: `packages/core/package.json`
- Create: `packages/core/src/types.ts`
- Create: `packages/core/src/status.ts`
- Create: `packages/core/src/sample-data.ts`
- Create: `packages/core/src/index.ts`
- Create: `packages/core/tsconfig.json`
- Modify: `tests/shared-platform.test.mjs`

**Interfaces:**
- Produces: `getProviderActivation(state): ActivationResult`, `getCoverageReadiness(state): ReadinessResult`, and typed sample records.

- [ ] **Step 1: Write failing transition tests**

Assert that an expired credential prevents activation, a pending authorization prevents insurance-ready state, approved or not-required authorization permits readiness when all other checks pass, and emergency intent returns an escalation result.

- [ ] **Step 2: Verify failure**

Run: `node --test tests/shared-platform.test.mjs`  
Expected: FAIL because status functions are unavailable.

- [ ] **Step 3: Implement minimal pure rules**

Represent each prerequisite explicitly and return `{ allowed, label, blockers }`; never infer a passed prerequisite from a generic `verified` boolean.

- [ ] **Step 4: Verify**

Run: `node --test tests/shared-platform.test.mjs`  
Expected: PASS for every transition and emergency-boundary case.

- [ ] **Step 5: Commit**

```bash
git add packages/core tests/shared-platform.test.mjs
git commit -m "feat: enforce CKare eligibility rules"
```

### Task 3: Supabase schema and row-level security baseline

**Files:**
- Create: `supabase/migrations/202607210001_ckare_platform.sql`
- Create: `supabase/seed.sql`
- Create: `supabase/README.md`
- Create: `tests/schema-contract.test.mjs`

**Interfaces:**
- Produces: tables for profiles, representatives, dependents, credentials, provider scopes, coverage checks, authorizations, bookings, visits, claims, payouts, consents, privacy requests, and audit events.

- [ ] **Step 1: Write schema contract tests**

Read the migration and assert every required table exists, row-level security is enabled for sensitive tables, and policies reference `auth.uid()`.

- [ ] **Step 2: Verify failure**

Run: `node --test tests/schema-contract.test.mjs`  
Expected: FAIL because the migration does not exist.

- [ ] **Step 3: Write migration and deterministic demo seed**

Use UUID primary keys, timestamped verification records, explicit status checks, unique idempotency keys for bookings and claims events, and restrictive policies. Seed only fictional people and identifiers.

- [ ] **Step 4: Verify**

Run: `node --test tests/schema-contract.test.mjs`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add supabase tests/schema-contract.test.mjs
git commit -m "feat: add CKare data and security baseline"
```

