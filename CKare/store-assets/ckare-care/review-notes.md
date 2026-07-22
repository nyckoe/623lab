# CKare Care reviewer notes

## Executable local-demo path

No production reviewer account is required for this build. The app opens in a fictional, signed-in local-demo state; Profile can toggle that state without contacting an authentication service.

1. Home opens Care for Maya with Maya’s fictional coverage, provider, visit, preferences, booking, and checklist data.
2. Profile → Switch to Leo changes the complete record across every tab. Leo’s pending authorization visibly blocks protected booking and visit actions through shared coverage policy.
3. Find Care → Route care request accepts routine text and can submit a fictional booking request when policy allows.
4. Enter urgent or self-harm language to exit matching and show 911/988 guidance stating CKare is not emergency dispatch.
5. Visits advances a three-step local checklist for an allowed person.
6. Coverage can queue a local coverage-help request; Profile can queue support and toggle local sign-in state.
7. Profile → Delete account first shows explicit confirmation. Confirming ends at “Deletion request submitted and pending”; it never claims deletion completed.

All people, plans, providers, coverage checks, and visits are fictional and remain on device for this demo session. Insurance verification does not guarantee payment.

## Owner-controlled production integrations

Before production submission, the owner must connect and validate authentication, representative authority, persistent household records, payer/provider and booking sources, support delivery, privacy links, and server-side deletion processing. Reviewer credentials, if later required, belong in the store console—not this repository.
