# CKare platform

CKare is a two-product care-workforce platform:

- **CKare Pro** for professionals and caregivers: qualifications, training, verified status, availability, eligible work, documentation, claims, and earnings.
- **CKare Care** for service receivers and authorized representatives: coverage readiness, qualified provider matching, bookings, visits, cost estimates, consent, and support.

The repository also retains the original CKare marketing prototype in `app/` and `index.html`.

## Ready-to-open web versions

Open either file directly in a modern browser or publish the `web/` directory with GitHub Pages:

- `web/ckare-pro.html`
- `web/ckare-care.html`

Both are self-contained, responsive, keyboard accessible, and contain interactive fictional workflows without external dependencies.

## Mobile apps

- `apps/ckare-pro` — Expo app, `com.ckare.pro`
- `apps/ckare-care` — Expo app, `com.ckare.care`

Both apps use Expo SDK 57 and import shared policy/design packages from `packages/`.
Use each app's tracked `.env.example` only as a placeholder template; the owner supplies Supabase values, EAS project IDs, and any notification credentials outside the repository.

## Shared platform

- `packages/core` — provider activation, coverage readiness, emergency routing, and shared domain types.
- `packages/design` — Quiet Confidence visual tokens.
- `supabase` — PostgreSQL migration, row-level security baseline, and fictional seed contract.
- `store-assets` — app-store artwork, listing copy, privacy worksheets, policies, reviewer notes, and checklists.

## Local verification

Requirements: Node.js 22.13 or newer and npm.

```bash
npm install
npm --prefix apps/ckare-pro install
npm --prefix apps/ckare-care install
node scripts/generate-store-assets.mjs
npm test
npm run build
npm run typecheck:pro
npm run typecheck:care
```

Start either app:

```bash
npm run start:pro
npm run start:care
```

## Safety and compliance boundaries

CKare does not grant professional licenses. Course completion, credential verification, payer enrollment, and marketplace activation are separate states. Insurance verification does not guarantee payment. CKare is not emergency dispatch.

Before production, complete legal, privacy, security, payer, regulated-entity, retention, signing, and store-account work listed in `store-assets/OWNER_INPUTS.md` and `STORE_SUBMISSION_README.md`.
