# CKare Release Remediation Plan

**Goal:** Close the Critical and Important issues identified by the whole-branch review before CKare is described as ready for store build validation.

**Constraints:** Preserve the two independent app identities, Quiet Confidence design system, fictional demo data, safety disclosures, and user-owned unrelated workspace changes. Use test-driven development. Never expose service-role credentials or permit clients to write server-authoritative compliance fields.

## Task 1: Harden the data and authorization boundary

**Files:** `supabase/migrations/202607210001_ckare_platform.sql`, `supabase/seed.sql`, `supabase/README.md`, `tests/schema-contract.test.mjs`

- Add the approved domain records needed for organizations, identities, jurisdictions, qualification tracks/verifications, services, availability, payer plans, matches, documentation, remittances, incidents, and complaints.
- Add reusable verified-representative authorization that requires a matching subject, verified authority, no revocation, and an allowed purpose.
- Replace broad owner `FOR ALL` policies with minimum-necessary read/create policies.
- Prevent clients from changing role, authority verification/revocation, coverage determinations, and privacy-request processing status through column-level grants and audited `SECURITY DEFINER` transition functions restricted to the service role.
- Add contract tests for protected-column grants, representative access predicates, revoked/unrelated isolation, and audited server transitions.

## Task 2: Make the web demos behaviorally safe and accessible

**Files:** `web/ckare-care.html`, `web/ckare-pro.html`, `tests/web-care.test.mjs`, `tests/web-pro.test.mjs`

- Store complete per-person Care view models and atomically rerender every person-specific field on household switch.
- Ensure Maya-specific content is absent after Arthur is selected and vice versa.
- Fix secondary dialog-button contrast.
- Move focus to a focusable destination heading and announce tab changes in both demos.
- Add executable DOM behavior tests for household isolation, dialogs, focus, and navigation announcements.

## Task 3: Implement native workflows and policy-derived gating

**Files:** both `apps/ckare-pro` and `apps/ckare-care` source trees plus native contract/behavior tests

- Replace no-op primary actions with explicit local demo workflows for sign-in state, learning/profile actions, work/booking decisions, person context switching, visit/documentation steps, support, and account-deletion initiation.
- Consume `@ckare/core` activation, coverage, and urgent-intent policies in app screens.
- Disable protected actions and render blockers when policy results are not allowed.
- Add a Care household context so all person-specific native data switches together.
- Use `SafeAreaProvider` and `SafeAreaView` from `react-native-safe-area-context`.
- Keep review notes and listings synchronized with executable behavior and clearly identify fictional demo data and owner-controlled production integrations.

## Task 4: Complete code-controlled store artifacts

**Files:** `scripts/generate-store-assets.mjs`, app/store asset folders, app configs, environment templates, store tests and release docs

- Generate fully opaque square iOS icons and assert dimensions plus alpha coverage.
- Add notification artwork and Expo notification configuration where supported.
- Add non-secret `.env.example` templates for both apps while retaining `.env*` secret ignores.
- Add reproducible screenshot source frames for every enabled phone/tablet listing size, or disable unsupported tablet targets.
- Update release documentation with asset regeneration and screenshot commands.

## Task 5: Final gate

- Run all Node tests, both native typechecks, the web build, both Expo Doctor checks, and production-only audits.
- Run a final independent whole-branch review and fix all remaining Critical/Important issues.
- Apply the finishing-a-development-branch workflow and report the exact branch and owner-only submission steps.
