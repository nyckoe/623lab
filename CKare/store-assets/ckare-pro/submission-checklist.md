# CKare Pro submission checklist

## Product and compliance

- [ ] Legal operating model and New York launch scope approved.
- [ ] Every training track states whether it is preparation, course completion, authorized certificate, or continuing education.
- [ ] Provider activation fails when identity, credential, checks, payer status, jurisdiction, or service scope is not ready.
- [ ] Rate, fee, tasks, authorization, documentation duty, cancellation, and estimated payout—not guaranteed language appear before acceptance.
- [ ] Emergency services routing is tested; CKare is not emergency dispatch.

## Build and signing

- [ ] Apple Developer and Google Play Console accounts are active.
- [ ] Bundle identifier/application ID `com.ckare.pro` is confirmed available and owned.
- [ ] EAS project, signing, production environment, and version are configured.
- [ ] Owner supplies EAS project ID and Apple/Google notification credentials; notification delivery remains owner-controlled outside this repository, and this demo has no token registration or live push delivery claim.
- [ ] iOS production archive and Android App Bundle pass clean-install and upgrade tests.
- [ ] No secrets, demo passwords, debug endpoints, or real care data are packaged.

## Store material

- [ ] Run `node scripts/generate-store-assets.mjs`; app icon, adaptive icon, launch art, all-white notification icon, feature graphic, and screenshots render correctly.
- [ ] Upload generated Apple 6.9-inch phone frames at 1320 × 2868 and Android phone frames at 1080 × 1920; tablet screenshots are not enabled.
- [ ] Apple and Google listing copy matches the submitted build.
- [ ] Privacy policy URL, support URL, marketing URL, and account deletion URL are public and functional.
- [ ] Apple app privacy and Google Data Safety forms match the final dependency/data inventory.
- [ ] Age/content rating, encryption, Health apps, and content-rights answers are approved.
- [ ] Reviewer account and instructions work from a clean device.

## Account and payments

- [ ] In-app Delete account initiates full deletion, not deactivation, and explains retained records.
- [ ] Sign in with Apple token revocation works if enabled.
- [ ] Digital training subscriptions use store billing and restore purchases if enabled.
- [ ] Real-world care payments and claims do not use digital in-app purchase products.
