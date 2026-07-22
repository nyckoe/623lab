# CKare Supabase baseline

This folder defines the shared data contract and restrictive row-level security baseline for CKare Pro and CKare Care. The baseline covers organizations, identities, jurisdictions, qualifications, services, availability, payer plans, matching, visits and documentation, claims and remittances, safety records, complaints, and privacy requests while retaining the original marketplace table names.

Apply the migration in a new Supabase project, then create authenticated users before loading the optional fictional seed. Administrative credential verification, coverage transactions, claims, and audit writes must run through reviewed server functions using a service role; clients must never receive that key.

Authenticated clients receive only policy-filtered reads and narrowly scoped creates for user-originated records. Column grants prevent clients from setting profile roles, representative verification or allowed purposes, coverage and authorization determinations, and privacy processing state. Those values move through `SECURITY DEFINER` functions with an empty search path; function execution is revoked from public, anonymous, and authenticated roles and granted only to `service_role`. Every protected transition requires a nonblank service actor/request identity and writes an `audit_events` record. The service role can select and append audit events but cannot update or delete them.

Representative policies call `has_verified_representative_access(subject_user_id, dependent_id, purpose)`. Access requires the caller's exact representative record, the exact subject and dependent context, a verified timestamp, no revocation timestamp, and the requested purpose in the server-approved purpose set. Authorities for another subject, another dependent, a wrong purpose, or an unverified/revoked record fail closed.

The optional seed uses deterministic fictional records and invokes the audited authority, coverage, and authorization transitions. Run it only as a trusted database bootstrap role after creating the three matching demo auth users documented by the UUIDs in `seed.sql`.

Run the focused pgTAP authorization integration test with Supabase CLI v1.11.4 or newer after starting the local stack:

```text
supabase start
supabase test db supabase/tests/rls_authorization.sql
```

The test proves booking, documentation, consent, and privacy access for a verified representative, then proves denial after revocation and for unrelated or wrong-purpose users.

Before production, replace demo users with controlled test accounts, add jurisdiction-specific retention schedules, complete a threat model, and validate every policy against the final operational roles.
