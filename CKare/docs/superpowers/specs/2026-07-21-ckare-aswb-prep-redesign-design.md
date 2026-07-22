# CKare ASWB Preparation Redesign

**Date:** July 21, 2026  
**Status:** Superseded by the approved two-app marketplace design in `2026-07-21-ckare-two-app-platform-design.md`
**Launch market:** New York  
**Tracks:** LMSW / ASWB Masters and LCSW / ASWB Clinical

## 1. Product definition

CKare v1 is a production-ready exam-preparation platform for New York social-work candidates. It provides accounts, synchronized progress, original learning content, practice simulations, subscriptions, and operational tooling across web, iOS, and Android.

CKare is an independent preparation product. Course completion, readiness scores, and practice results are not a New York license, ASWB approval, authorization to test, or a guarantee of passing. The product must link learners to current ASWB and New York State Education Department guidance.

## 2. Authoritative regulatory model

- New York LMSW candidates prepare for the ASWB Masters examination.
- New York LCSW candidates prepare for the ASWB Clinical examination.
- The learner's scheduled test date selects the applicable ASWB blueprint.
- Exams before August 3, 2026 use the 2018 blueprint and 170-question format.
- Exams on or after August 3, 2026 use the 2026 blueprint, three content areas, 122 total questions, and a four-hour limit.
- CKare content must be original. The platform must not solicit, store, or reproduce recalled live exam questions or protected ASWB practice-test content.
- Licensure eligibility is determined by NYSED; exam administration is handled by ASWB.

Official references:

- [ASWB 2026 exam transition](https://www.aswb.org/2026exams/)
- [ASWB Examination Guidebook](https://www.aswb.org/exam/getting-ready-for-the-exam/aswb-examination-guidebook/)
- [NYSED LMSW requirements](https://www.op.nysed.gov/professions/licensed-master-social-worker/license-requirements)
- [NYSED LCSW requirements](https://www.op.nysed.gov/professions/licensed-clinical-social-worker/license-requirements)

## 3. Architecture

The repository becomes a TypeScript monorepo with four principal surfaces:

1. `apps/web`: the existing Next.js/Vinext application for marketing, onboarding, lessons, practice, progress, web billing, support, privacy, terms, and account deletion.
2. `apps/mobile`: an Expo React Native application that produces iOS and Android builds with native navigation, offline study, reminders, practice exams, and mobile subscriptions.
3. `packages/core`: framework-independent curriculum types, blueprint selection, scoring, spaced-review scheduling, entitlement rules, sync contracts, and validation.
4. `packages/ui`: shared design tokens, content terminology, accessibility conventions, and platform-adapted component contracts.

Supabase provides PostgreSQL, authentication, row-level authorization, storage, and server functions. RevenueCat normalizes Apple App Store and Google Play subscriptions. Stripe handles web subscriptions. Both payment paths write to one server-owned entitlement model; clients never grant premium access based solely on local purchase state.

## 4. Experience architecture

Primary navigation is `Today`, `Learn`, `Practice`, `Progress`, and `Profile`.

### Onboarding

1. Create an account with email/password, Sign in with Apple, or Sign in with Google.
2. Select Masters/LMSW or Clinical/LCSW.
3. Enter an exam date or choose “not scheduled.”
4. Review the selected blueprint and CKare's regulatory disclaimer.
5. Complete a short diagnostic or skip it.
6. Receive a generated study plan.

The exam date can be changed. A blueprint change preserves historical attempts under their original content version and creates a new active study plan.

### Today

The home screen shows the next study session, days until exam, review queue, readiness signal, and one primary continuation action. It does not present a generic course marketplace.

### Learn

Lessons combine concise instruction, applied scenarios, knowledge checks, rationales, and remediation. Learners can download permitted notes and resume at the last completed unit. Content is organized by track, blueprint version, content area, competency, and knowledge statement.

### Practice

Practice supports targeted question sets, adaptive review, and a timed full simulation matching the selected exam format. Questions support bookmarking and a review screen. Every answer includes an original rationale after submission; timed simulations can defer explanations until completion.

### Progress

Progress reports mastery signals by content area, recent accuracy, review due, study consistency, and recommended next actions. Readiness is described as CKare practice performance and never as a predicted ASWB score or pass probability.

### Profile

Profile contains track and exam-date settings, accessibility preferences, notification preferences, subscription management, official resource links, privacy controls, data export, and account deletion.

## 5. Visual and interaction system

The approved direction is **Quiet Confidence**:

- warm parchment surfaces;
- deep evergreen text and primary controls;
- restrained coral accents for active learning moments;
- editorial display typography paired with a highly legible interface sans serif;
- generous whitespace and clear information hierarchy;
- calm, purposeful transitions with full reduced-motion support;
- no decorative gradients, wellness clichés, faux medical imagery, or excessive dashboard chrome.

Web and mobile share tokens and information architecture while using platform-native navigation, controls, safe areas, gestures, and accessibility behavior.

## 6. Core data model

- `profiles`: account identity, locale, timezone, accessibility preferences, and consent versions.
- `learner_tracks`: Masters or Clinical, exam date, active blueprint, onboarding state, and study-plan settings.
- `blueprints`: effective dates, exam format, content areas, and source metadata.
- `content_items`: versioned lessons, questions, rationales, objectives, mappings, editorial state, and original-content attestation.
- `study_plans`: generated sessions, scheduled dates, completion state, and revision history.
- `attempts`: immutable question responses, timing, content version, confidence, and sync idempotency key.
- `progress_snapshots`: derived mastery and review signals, never the source of truth for attempts.
- `subscriptions`: provider, external customer reference, status, renewal data, and server-computed entitlement.
- `privacy_requests`: export/deletion request, status, verification, and completion record.
- `audit_events`: sensitive administrative and content-publishing actions.

Row-level policies restrict learners to their own records. Published curriculum is readable to entitled clients; drafts and editorial metadata are restricted to authorized operators.

## 7. Synchronization and offline behavior

Mobile caches downloaded lessons, question sets, plan metadata, and unsent attempts in encrypted local storage. Each attempt receives a client-generated idempotency key. Synchronization is append-first: immutable attempts upload safely, the server acknowledges accepted keys, and derived progress is recalculated server-side.

If connectivity fails, learners may continue downloaded work and see a visible offline state. Retries use bounded backoff. Signing out removes locally cached personal data. A content update never mutates the version attached to a completed attempt.

## 8. Authentication, billing, and entitlement

- Email/password requires verified email.
- Apple and Google sign-in are available on supported platforms.
- Session refresh preserves unsaved local study work.
- Account deletion is available in-app and through a public web route.
- Apple and Google purchases use RevenueCat and include restore purchases.
- Web purchases use Stripe Checkout and the Stripe customer portal.
- RevenueCat and Stripe webhooks are authenticated, replay-safe, and idempotent.
- A server-owned entitlement record determines premium access.
- Failed or expired billing retains free-tier access and preserves learning history.

Final product identifiers, subscription prices, trial terms, and legal seller names are deployment inputs supplied by the account owner before submission.

## 9. Accessibility and privacy

The target is WCAG 2.2 AA on web and equivalent native support:

- semantic structure and screen-reader labels;
- keyboard operability and visible focus;
- Dynamic Type and text scaling without clipping;
- minimum touch targets and non-color state indicators;
- reduced motion;
- captions and transcripts for audiovisual content;
- accessible timed-exam warnings and pause rules that match the simulation contract;
- plain-language privacy and consent text.

The system collects only data required for accounts, learning, billing, support, and product operation. It does not collect patient information or provide clinical care. Data exports and deletions are auditable. Analytics must exclude question text, free-form sensitive content, credentials, and payment details.

## 10. Error handling

- Offline work queues locally and synchronizes when connectivity returns.
- Duplicate uploads are ignored using idempotency keys.
- Expired sessions reauthenticate without discarding in-progress answers.
- Payment outages preserve free access and existing learning data.
- Webhook failures retry and surface to operations monitoring.
- Unsupported or stale curriculum versions fail closed for new sessions while historical results remain readable.
- Administrative publication requires validation of track, blueprint, mappings, rationale, source review, and original-content attestation.
- User-facing errors state what happened, whether work was saved, and the next safe action.

## 11. Quality strategy

- Unit tests cover blueprint selection, scoring, review scheduling, entitlement, and validation.
- Database and API tests cover row-level authorization and administrative permissions.
- Contract tests cover Stripe and RevenueCat webhook signatures, retries, and duplicate events.
- Web end-to-end tests cover onboarding, learning, practice, billing, deletion, and responsive layouts.
- Native tests cover navigation, offline downloads, attempt queues, purchase restoration, deep links, and accessibility labels.
- Accessibility testing combines automation with keyboard and screen-reader checks.
- Release verification includes production web build, iOS archive, Android App Bundle, clean-install smoke tests, upgrade tests, and offline/resume tests.

## 12. Store and deployment deliverables

### Web

- production Next.js/Vinext source and environment template;
- database migrations and seed content;
- deployment configuration;
- privacy policy, terms, support, subscription management, and account-deletion routes;
- responsive assets, metadata, sitemap, and social preview.

### Apple App Store

- Expo/EAS iOS configuration using the provisional bundle identifier `com.ckare.prep`, which the owner must confirm is available before signing;
- app icon and launch assets;
- signed archive workflow;
- subscription product mapping and restore flow;
- App Store title, subtitle, description, keywords, promotional text, review notes, and test-account instructions;
- required screenshot plan and generated screenshot source frames;
- privacy questionnaire worksheet, age-rating guidance, support URL, privacy URL, and account-deletion URL;
- submission checklist.

### Google Play

- Expo/EAS Android configuration using the provisional application id `com.ckare.prep`, which the owner must confirm is available before signing;
- adaptive icon, notification icon, and launch assets;
- signed Android App Bundle workflow;
- subscription product mapping and restore flow;
- store title, short description, full description, release notes, and test-account instructions;
- phone/tablet screenshot plan, feature graphic source, and icon source;
- Data Safety worksheet, content-rating guidance, support URL, privacy URL, and account-deletion URL;
- internal-testing and production-release checklist.

Actual signing, legal attestations, tax/banking setup, product creation, and store submission require the owner's Apple Developer, Google Play Console, Supabase, Stripe, and RevenueCat accounts.

## 13. Release boundaries

Included in v1:

- New York Masters/LMSW and Clinical/LCSW preparation;
- pre- and post-August 3, 2026 blueprint selection;
- accounts, synchronized progress, offline mobile study, subscriptions, and production operations;
- responsive web, iOS, and Android release projects;
- submission-ready metadata, policies, asset sources, and checklists.

Excluded from v1:

- licensure application submission on a learner's behalf;
- credential verification or marketplace booking;
- patient care, clinical advice, crisis intervention, or health-record storage;
- recalled ASWB questions or copied proprietary test content;
- jurisdictions outside New York;
- institutional licensing, instructor-led cohorts, or employer dashboards.

## 14. Acceptance criteria

The release is complete when:

1. A learner can create an account, select either track, set an exam date, and receive the correct blueprint-specific plan.
2. Progress synchronizes across web and mobile, and downloaded mobile study works offline without duplicate attempts.
3. Targeted practice and full simulations match the selected blueprint's question count and timing.
4. Stripe and RevenueCat purchases produce the same server-owned entitlement and can be restored or managed.
5. Learners can export data and initiate account deletion in-app and on the web.
6. Regulatory disclaimers and official links appear at onboarding, readiness, subscription, and resource touchpoints.
7. Automated tests pass and accessibility checks find no release-blocking issue.
8. Production web, iOS archive, and Android App Bundle build successfully from documented commands.
9. Apple and Google submission packages contain all code-controlled assets, metadata, privacy worksheets, review instructions, and checklists; remaining owner-supplied credentials and legal details are explicitly listed.
