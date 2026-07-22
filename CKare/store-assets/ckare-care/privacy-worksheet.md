# CKare Care privacy and data-safety worksheet

This is a production review worksheet, not a completed legal attestation. The account owner must compare every answer with the final app, backend, analytics, payment SDKs, support tools, and retention policy.

## Apple App Privacy draft

Likely data linked to the user:

- Contact info: name, email, phone — account management, authentication, support, and reminders.
- Identifiers: user ID — account, security, synchronization.
- Health-related and care information: requested service, accessibility needs, minimum intake, consent, appointment information — app functionality. Collect only what is necessary.
- Insurance and financial information: plan/member references, benefit and cost estimates, payment-responsibility metadata — coverage and payment functionality. Never store full payment credentials in CKare clients.
- User content: authorized-representative records, booking communication, feedback, support requests — app functionality.
- Usage data and diagnostics: feature interactions, crash and performance data — analytics and reliability; exclude sensitive care text.
- Coarse location: only when the user chooses distance-based matching. Do not request precise background location.

Tracking across other companies' apps/sites: No, unless the final SDK inventory introduces advertising or cross-app tracking. Do not add advertising identifiers.

## Google Play Data Safety draft

- Data collected: personal info, health-related/care info, financial metadata, app activity, diagnostics, and user-generated content.
- Data sharing: service providers acting on CKare's behalf may process data; validate whether any transfer meets Google's definition of sharing.
- Purposes: app functionality, account management, fraud/security, developer communications, analytics, and payments.
- Encryption in transit: Required.
- Account deletion: available in Profile and through the public deletion web resource.
- Data export: available through Profile/support workflow.
- Sale of data: No.

## Permissions

The baseline app declares no sensitive Android permissions. If notifications, camera insurance-card capture, photo upload, location, microphone, video, or calendar integration are added, update both stores and show purpose-specific consent before collection.

## Required final review

Inventory Supabase, payer/eligibility integrations, RevenueCat, Stripe, crash reporting, analytics, support, email/SMS, and identity-verification SDKs. Update the worksheet whenever any dependency or data flow changes.
