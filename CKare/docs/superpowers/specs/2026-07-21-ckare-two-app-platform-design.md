# CKare Two-App Platform Design

**Date:** July 21, 2026  
**Status:** Approved  
**Source of truth:** `PROJECT_PLAN_CKare.md`

## Product boundary

CKare launches as two separately packaged products backed by one shared platform:

- **CKare Pro** serves licensed social workers, social-work candidates, home health aides, personal care aides, direct support professionals, supervisors, and approved provider organizations.
- **CKare Care** serves adults seeking services, authorized representatives, guardians, family caregivers, case managers, and care coordinators.

The products support qualified-care access and workforce operations. They do not grant licenses, guarantee payer reimbursement, provide emergency dispatch, or allow a worker to offer regulated services before identity, credential, exclusion, background, scope, and payer requirements are satisfied.

## Deliverables

1. `apps/ckare-pro`: standalone Expo React Native project for iOS and Android, bundle/application ID `com.ckare.pro` subject to owner availability confirmation.
2. `apps/ckare-care`: standalone Expo React Native project for iOS and Android, bundle/application ID `com.ckare.care` subject to owner availability confirmation.
3. `web/ckare-pro.html`: responsive, interactive, dependency-light browser experience for professionals and caregivers.
4. `web/ckare-care.html`: responsive, interactive, dependency-light browser experience for service receivers and representatives.
5. `packages/core`: shared TypeScript domain types, status rules, sample data, validation, and formatting.
6. `packages/design`: shared visual tokens, copy rules, accessibility requirements, and platform mappings.
7. `supabase`: PostgreSQL schema, row-level security policies, seed data, and server-function contracts.
8. `store-assets`: source artwork, listing copy, privacy/data-safety worksheets, review notes, screenshot specifications, release checklists, and owner-input checklist for both apps.

## Architecture

The repository is an npm workspace. Each Expo app remains independently buildable and independently submitted, while importing shared domain and design packages. The two static HTML experiences contain their own presentation and interaction logic so they can be opened directly or served from any static host.

Supabase provides authentication, PostgreSQL, row-level authorization, storage, and server-side operations. Server-owned policies determine activation, eligibility, matching, authorization, and entitlement. Clients may render status but cannot promote a user, activate a regulated service, or mark insurance-ready status without an authorized server transition.

Stripe supports web payments where legally applicable. Native in-app purchases are limited to digital training content and use Apple/Google billing through RevenueCat. Payments for real-world care services use compliant external payment or claims flows and are not treated as app-store digital purchases.

## Visual system

The approved **Quiet Confidence** direction uses warm parchment surfaces, deep evergreen typography and controls, restrained coral accents, editorial display typography, highly legible sans-serif body text, generous space, and calm purposeful motion. It avoids generic medical blue, wellness clichés, excessive cards, and decorative dashboard clutter.

The two products are visibly related but distinct:

- CKare Pro emphasizes credential progress, schedule control, tasks, and earnings.
- CKare Care emphasizes coverage clarity, trusted matching, upcoming care, and representative context.

Both products support keyboard navigation, screen readers, text scaling, reduced motion, minimum touch targets, non-color status cues, and WCAG 2.2 AA web behavior.

## CKare Pro experience

Primary navigation: `Home`, `Learn`, `Work`, `Earnings`, `Profile`.

### Home

Shows the professional's current activation state, next required qualification step, upcoming booking, outstanding documentation, and one primary action. A role-and-jurisdiction selector controls which qualification track is displayed.

### Learn

Supports jurisdiction-specific direct-care training, ASWB-aligned original exam preparation, continuing education, assessments, onsite/practical booking where applicable, and completion records. Course completion is explicitly separated from certificates, licenses, registry status, payer credentialing, and marketplace activation.

### Work

Provides availability, service area, compatible referral/booking details, authorization status, required tasks, accessibility and safety needs, check-in/out, structured documentation, cancellation, incident, and emergency-boundary flows. Acceptance is disabled when scope, credential, network, or authorization rules fail.

### Earnings

Shows disclosed rate or allowed amount, platform/administrative fee, claim lifecycle, estimated non-guaranteed payout date, adjustments, denials, appeals, recoupments, and downloadable statements.

### Profile

Contains identity status, credentials, expiration dates, background/exclusion status, payer enrollment, service scope, insurance, tax/payment settings, accessibility, language, privacy, support, export, and deletion controls.

## CKare Care experience

Primary navigation: `Home`, `Find Care`, `Visits`, `Coverage`, `Profile`.

### Home

Shows whose care context is active, coverage readiness, the next appointment, an authorization task, and one primary action. Representative users can switch dependents without mixing records.

### Find Care

Starts with service need and urgency screening. Emergencies route to emergency or crisis resources instead of marketplace booking. Results prioritize eligibility, service scope, network, authorization compatibility, language, accessibility, continuity, travel practicality, and availability. Paid placement cannot override safety or eligibility.

### Visits

Supports booking review, minimum-necessary intake, consent, reminders, preparation, secure communication, appointment status, cancellation, feedback, follow-up, and approved substitution. Coverage estimates and cancellation rules are shown before confirmation.

### Coverage

Displays separate timestamped states for identity, active coverage, benefit found, provider network, referral/order, authorization, cost estimate, and insurance-ready booking. Insurance verification is never presented as guaranteed payment.

### Profile

Contains identity, representative authority, dependents, consent, communication, accessibility, language, payment responsibility, privacy, support, export, and deletion controls.

## Shared domain model

Core records include users, organizations, identities, representatives, dependents, jurisdictions, qualification tracks, credentials, verifications, services, provider scopes, availability, payer plans, coverage checks, authorizations, matches, bookings, visits, documentation, claims, remittances, payouts, consents, incidents, complaints, privacy requests, and audit events.

Every credential state stores issuer, source, verification method, effective date, expiration, last check, jurisdiction, and service scope. Every coverage estimate stores payer source, timestamp, benefit details, limitations, network status, authorization state, and disclosure version.

Row-level policies prevent cross-household and cross-provider access. Operations roles receive only the minimum data required for assigned credential, safety, authorization, claims, or support work. Sensitive reads and administrative transitions are audited.

## Critical workflows

### Professional activation

`unverified → identity_verified → qualification_in_progress → training_complete_pending_evaluation → credential_verified → checks_cleared → payer_pending → payer_ready → marketplace_active`

Suspended, expired, sanctioned, and under-review states interrupt activation. Marketplace activity is service- and jurisdiction-specific.

### Insurance readiness

`identity_verified → coverage_active → benefit_found → provider_in_network → authorization_not_required|approved → estimate_available → ready_to_book`

Pending, denied, expired, out-of-network, or missing-referral states remain visible and block insurance-ready presentation when required.

### Booking

Search results include only in-scope candidates. Booking validates provider activation, service scope, availability, continuity, coverage/payment path, authorization, consent, and minimum intake. Final confirmation creates audit and notification events. Revalidation occurs before service.

## Failure and safety behavior

- Network failures preserve draft forms and clearly show synchronization state.
- Duplicate booking, documentation, and payment events are idempotent.
- Expired credentials or authorizations block affected transitions without deleting historical records.
- Coverage API failures show “unable to verify” rather than inferred eligibility.
- Payment and claims failures preserve care records and expose support/appeal routes.
- Emergencies route to local emergency services or appropriate crisis resources.
- Safety, credential, coverage, and claims disputes escalate to trained human operations.
- User-facing errors state what was saved, what is blocked, and the next safe action.

## Testing

- Unit tests cover status transitions, scope matching, authorization readiness, fee disclosure, and formatting.
- Database tests cover row-level policies and privileged transitions.
- Contract tests cover coverage, payment, claims, Stripe, and RevenueCat webhook idempotency.
- Web tests cover both standalone HTML workflows at desktop and mobile widths.
- Native tests cover navigation, offline drafts, deep links, accessibility labels, notifications, and release configuration.
- Release smoke tests cover clean installs, upgrades, sign-in, deletion, purchase restoration for digital content, and core role workflows.

## Store submission package

Each app receives:

- Expo configuration, EAS build profiles, bundle/application ID, versioning, permissions, deep-link scheme, and environment template;
- app icon, adaptive Android icon, splash/launch artwork, notification icon, and store artwork source;
- Apple and Google listing titles, subtitles/short descriptions, long descriptions, keywords, promotional text, release notes, support text, and review notes;
- screenshot shot list and source frames for required phone/tablet sizes;
- Apple privacy worksheet, Google Data Safety worksheet, content/age-rating guidance, encryption/export-compliance notes, and permission rationale;
- privacy-policy, terms, support, and account-deletion URL requirements;
- test-account instructions and submission checklist.

Actual signing, store account creation, tax/banking setup, legal attestations, regulated-entity claims, payer contracts, production credentials, and final submission remain owner actions.

## Acceptance criteria

1. Both Expo apps start independently and pass type checking and tests.
2. Each app exposes its complete primary navigation and core sample workflows without cross-role leakage.
3. Both standalone HTML files open directly, adapt to mobile and desktop widths, and provide functional navigation and interactions.
4. Shared status logic prevents invalid provider activation and insurance-ready states.
5. Accessibility automation and manual keyboard checks find no release-blocking issue.
6. Supabase migrations define the shared model and row-level security baseline.
7. Android and iOS release configurations are complete aside from owner credentials and signing material.
8. Store folders contain all code-controlled metadata, policy drafts, artwork sources, screenshot specifications, review instructions, and explicit owner-supplied inputs.
