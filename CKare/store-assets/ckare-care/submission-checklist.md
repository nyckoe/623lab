# CKare Care submission checklist

## Product and compliance

- [ ] Legal operating model, New York services, payer/payment paths, and representative-authority process are approved.
- [ ] Household/dependent contexts cannot mix records.
- [ ] Identity, coverage, benefit, network, referral/order, authorization, and estimate statuses remain separate.
- [ ] Insurance verification does not guarantee payment appears before booking and in store copy.
- [ ] Provider ranking cannot override verified scope, network, authorization, safety, or continuity.
- [ ] Emergency services routing is tested; CKare is not emergency dispatch.

## Build and signing

- [ ] Apple Developer and Google Play Console accounts are active.
- [ ] Bundle identifier/application ID `com.ckare.care` is confirmed available and owned.
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
- [ ] Public web account-deletion resource allows a request without reinstalling the app.
- [ ] Real-world care payments and claims use the approved external payer/private-pay path.
