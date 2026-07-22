# CKare Pro privacy and data-safety worksheet

This is a production review worksheet, not a completed legal attestation. The account owner must compare every answer with the final app, backend, analytics, payment SDKs, support tools, and retention policy.

## Apple App Privacy draft

Likely data linked to the user:

- Contact info: name, email, phone — account management, authentication, support, notifications.
- Identifiers: user ID — account, security, synchronization.
- Professional information: role, jurisdiction, credentials, qualification and verification status — app functionality and compliance operations.
- Financial information: payout destination references and tax-status metadata — payments; never store full card or bank credentials in CKare clients.
- User content: availability, booking communication, documentation, support requests — app functionality.
- Usage data and diagnostics: feature interactions, crash and performance data — analytics and product reliability; exclude sensitive note text.
- Coarse location or service area: only when the final product transmits it for matching. Do not request precise background location.

Tracking across other companies' apps/sites: No, unless the final SDK inventory introduces advertising or cross-app tracking. Do not add advertising identifiers.

## Google Play Data Safety draft

- Data collected: personal info, professional info, app activity, app diagnostics, financial metadata, and user-generated operational content.
- Data sharing: service providers acting on CKare's behalf may process data; validate whether any transfer meets Google's definition of sharing.
- Purposes: app functionality, account management, fraud/security, developer communications, analytics, and payments.
- Encryption in transit: Required.
- Account deletion: available in Profile and through the public deletion web resource.
- Data export: available through Profile/support workflow.
- Sale of data: No.

## Permissions

The baseline app declares no sensitive Android permissions. If notifications, camera document capture, photo upload, or calendar integration are added, update both store disclosures and in-app purpose text before release.

## Required final review

Inventory Supabase, RevenueCat, Stripe, crash reporting, analytics, support, email/SMS, and any identity-verification SDK. Update the worksheet whenever any dependency or data flow changes.
