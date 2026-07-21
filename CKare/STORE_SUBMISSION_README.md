# CKare mobile build and store-submission handoff

This repository contains code-controlled material for two independent store listings. Actual signing and submission require the owner's Apple Developer and Google Play Console accounts.

## 1. Verify source

From the repository root:

```bash
npm install
npm --prefix apps/ckare-pro install
npm --prefix apps/ckare-care install
node scripts/generate-store-assets.mjs
npm test
npm run build
npm run typecheck:pro
npm run typecheck:care
npm run doctor:pro
npm run doctor:care
```

Resolve every failing command before release. Run each app on at least one physical iPhone and Android phone. Test clean install, upgrade, sign-in, household/role separation, offline draft recovery, support, data export, account deletion, and any enabled purchase restoration.

## 2. Configure owner values

Confirm the availability and ownership of:

- `com.ckare.pro`
- `com.ckare.care`

Copy each app's `.env.example` to a local ignored `.env` only when configuring owner-supplied values. Create separate EAS projects and add their owner-supplied project IDs through the release environment; never commit environment files, project IDs, or secrets. Notification credentials are owner-controlled: configure Apple/Google push credentials in EAS and the store accounts only after notification delivery is implemented and validated. This local demo has no token registration and does not claim push delivery is live. Complete `store-assets/OWNER_INPUTS.md`.

## 3. Regenerate code-controlled store assets

From the repository root, regenerate every PNG from its checked-in SVG source:

```bash
node scripts/generate-store-assets.mjs
```

Each app supplies only enabled phone frames: Apple 6.9-inch at 1320 × 2868 and Android phone at 1080 × 1920. Tablet screenshots are not enabled because `ios.supportsTablet` is false; do not upload tablet frames.

## 4. Build CKare Pro

```bash
cd apps/ckare-pro
eas build --platform ios --profile production
eas build --platform android --profile production
```

After internal verification:

```bash
eas submit --platform ios --profile production
eas submit --platform android --profile production
```

## 5. Build CKare Care

```bash
cd apps/ckare-care
eas build --platform ios --profile production
eas build --platform android --profile production
```

After internal verification:

```bash
eas submit --platform ios --profile production
eas submit --platform android --profile production
```

## 6. Apple sequence

1. Create each App Store Connect record using its confirmed bundle identifier.
2. Create digital subscription products only if the submitted binary enables digital training purchases.
3. Upload the EAS archive to TestFlight.
4. Complete pricing/availability, age rating, encryption, content rights, privacy answers, URLs, review contact, and reviewer credentials.
5. Upload the generated 1320 × 2868 Apple phone screenshots and verify text at actual size; tablet screenshots are not enabled.
6. Test Sign in with Apple and token revocation if enabled.
7. Verify Profile → Delete account initiates deletion and explains retained records.
8. Submit to review and monitor resolution-center messages.

## 7. Google sequence

1. Create each Play Console app with its confirmed application ID.
2. Upload the Android App Bundle to internal testing first.
3. Complete App access, Ads, Content rating, Target audience, News, Health apps, Financial features, Data Safety, and account-deletion declarations as applicable.
4. Publish the privacy policy and functional web deletion-request URL.
5. Upload the generated 1080 × 1920 Android phone screenshots and the supplied 1024 × 500 feature graphic; tablet screenshots are not enabled.
6. Add reviewer credentials and navigation instructions.
7. Promote through closed testing and production only after policy and device verification.

## 8. Versioning and rollback

EAS production profiles use automatic build-number/version-code increments. Tag the source commit used for each submission. Retain the previous accepted store build for rollback, and never reuse a version code or build number.

If a release introduces a safety, privacy, authorization, or record-access defect, stop rollout in the store console, disable the affected server feature, notify operations, and submit a tested corrective build.
