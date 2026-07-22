begin;

create extension if not exists pgtap with schema extensions;
select plan(26);

insert into auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('10000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'rls-subject@example.invalid', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('10000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'rls-representative@example.invalid', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('10000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'rls-unrelated@example.invalid', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('10000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'rls-wrong-purpose@example.invalid', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('10000000-0000-0000-0000-000000000005', 'authenticated', 'authenticated', 'rls-provider@example.invalid', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('10000000-0000-0000-0000-000000000006', 'authenticated', 'authenticated', 'rls-cross-provider@example.invalid', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('10000000-0000-0000-0000-000000000007', 'authenticated', 'authenticated', 'rls-cross-subject@example.invalid', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now());

insert into public.profiles (id, role, display_name) values
  ('10000000-0000-0000-0000-000000000001', 'service_receiver', 'RLS Subject'),
  ('10000000-0000-0000-0000-000000000002', 'representative', 'RLS Representative'),
  ('10000000-0000-0000-0000-000000000003', 'representative', 'RLS Unrelated'),
  ('10000000-0000-0000-0000-000000000004', 'representative', 'RLS Wrong Purpose'),
  ('10000000-0000-0000-0000-000000000005', 'professional', 'RLS Provider'),
  ('10000000-0000-0000-0000-000000000006', 'professional', 'RLS Cross-household Provider'),
  ('10000000-0000-0000-0000-000000000007', 'service_receiver', 'RLS Cross-household Subject');

insert into public.identities (id, user_id, verification_status, source, verification_method, verified_at) values
  ('11000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'verified', 'rls test', 'fixture', now()),
  ('11000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'verified', 'rls test', 'fixture', now()),
  ('11000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'verified', 'rls test', 'fixture', now()),
  ('11000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'verified', 'rls test', 'fixture', now()),
  ('11000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'verified', 'rls test', 'fixture', now()),
  ('11000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000006', 'verified', 'rls test', 'fixture', now()),
  ('11000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000007', 'verified', 'rls test', 'fixture', now());

insert into public.dependents (id, owner_user_id, display_name, relationship_label) values
  ('12000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'RLS Dependent', 'test dependent'),
  ('12000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000007', 'RLS Cross-household Dependent', 'cross-household test dependent');

insert into public.representatives (
  id, user_id, subject_user_id, dependent_id, authority_type
) values
  ('13000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '12000000-0000-0000-0000-000000000001', 'test authority'),
  ('13000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', '12000000-0000-0000-0000-000000000001', 'wrong-purpose test authority');

select public.transition_representative_authority(
  '13000000-0000-0000-0000-000000000001', 'verify',
  array['care','consent','privacy'], 'rls-test:setup'
);
select public.transition_representative_authority(
  '13000000-0000-0000-0000-000000000002', 'verify',
  array['coverage'], 'rls-test:setup'
);

insert into public.bookings (
  id, requester_user_id, subject_user_id, provider_user_id, dependent_id,
  service_code, starts_at, payment_path, idempotency_key
) values (
  '14000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000005',
  '12000000-0000-0000-0000-000000000001',
  'personal-care', now() + interval '1 day', 'private_pay', 'rls-booking-1'
);
insert into public.bookings (
  id, requester_user_id, subject_user_id, provider_user_id, dependent_id,
  service_code, starts_at, payment_path, idempotency_key
) values (
  '14000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000007',
  '10000000-0000-0000-0000-000000000007',
  '10000000-0000-0000-0000-000000000006',
  '12000000-0000-0000-0000-000000000002',
  'personal-care', now() + interval '2 days', 'private_pay', 'rls-booking-2'
);
insert into public.visits (id, booking_id) values (
  '15000000-0000-0000-0000-000000000001',
  '14000000-0000-0000-0000-000000000001'
);
insert into public.documentation (id, visit_id, author_user_id, content) values (
  '16000000-0000-0000-0000-000000000001',
  '15000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000005',
  '{"note":"RLS fixture"}'::jsonb
);
insert into public.consents (
  id, user_id, subject_user_id, dependent_id, consent_type, document_version, granted_at
) values (
  '17000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000001',
  '12000000-0000-0000-0000-000000000001',
  'care', 'rls-v1', now()
);
insert into public.privacy_requests (
  id, user_id, subject_user_id, dependent_id, request_type
) values (
  '18000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000001',
  '12000000-0000-0000-0000-000000000001',
  'export'
);

-- Forced mismatched fixtures prove that an unrelated booking provider cannot read
-- incident/complaint subject data even if trusted code inserted a malformed link.
insert into public.incidents (
  id, booking_id, reporter_user_id, subject_user_id, dependent_id, severity, description
) values (
  '19000000-0000-0000-0000-000000000001',
  '14000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000001',
  '12000000-0000-0000-0000-000000000001',
  'low', 'Cross-household incident fixture'
);
insert into public.complaints (
  id, complainant_user_id, subject_user_id, dependent_id, booking_id, description
) values (
  '1a000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000001',
  '12000000-0000-0000-0000-000000000001',
  '14000000-0000-0000-0000-000000000002',
  'Cross-household complaint fixture'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);
select is((select count(*) from public.bookings), 1::bigint, 'verified representative can read booking');
select is((select count(*) from public.documentation), 1::bigint, 'verified representative can read documentation');
select is((select count(*) from public.consents), 1::bigint, 'verified representative can read consent');
select is((select count(*) from public.privacy_requests), 1::bigint, 'verified representative can read privacy request');
select throws_ok(
  $$insert into public.incidents (
      id, booking_id, reporter_user_id, subject_user_id, dependent_id, severity, description
    ) values (
      '19000000-0000-0000-0000-000000000002',
      '14000000-0000-0000-0000-000000000002',
      '10000000-0000-0000-0000-000000000002',
      '10000000-0000-0000-0000-000000000001',
      '12000000-0000-0000-0000-000000000001',
      'low', 'Must be denied'
    )$$,
  '42501', 'new row violates row-level security policy for table "incidents"',
  'cross-household incident booking link denied on insert'
);
select throws_ok(
  $$insert into public.complaints (
      id, complainant_user_id, subject_user_id, dependent_id, booking_id, description
    ) values (
      '1a000000-0000-0000-0000-000000000002',
      '10000000-0000-0000-0000-000000000002',
      '10000000-0000-0000-0000-000000000001',
      '12000000-0000-0000-0000-000000000001',
      '14000000-0000-0000-0000-000000000002',
      'Must be denied'
    )$$,
  '42501', 'new row violates row-level security policy for table "complaints"',
  'cross-household complaint booking link denied on insert'
);

reset role;
select public.transition_representative_authority(
  '13000000-0000-0000-0000-000000000001', 'revoke',
  null::text[], 'rls-test:revocation'
);
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);
select is((select count(*) from public.bookings), 0::bigint, 'revoked representative cannot read booking');
select is((select count(*) from public.documentation), 0::bigint, 'revoked representative cannot read documentation');
select is((select count(*) from public.consents), 0::bigint, 'revoked representative cannot read consent');
select is((select count(*) from public.privacy_requests), 0::bigint, 'revoked representative cannot read privacy request');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000004', true);
select is((select count(*) from public.bookings), 0::bigint, 'wrong-purpose representative cannot read booking');
select is((select count(*) from public.documentation), 0::bigint, 'wrong-purpose representative cannot read documentation');
select is((select count(*) from public.consents), 0::bigint, 'wrong-purpose representative cannot read consent');
select is((select count(*) from public.privacy_requests), 0::bigint, 'wrong-purpose representative cannot read privacy request');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000003', true);
select is((select count(*) from public.bookings), 0::bigint, 'unrelated user cannot read booking');
select is((select count(*) from public.documentation), 0::bigint, 'unrelated user cannot read documentation');
select is((select count(*) from public.consents), 0::bigint, 'unrelated user cannot read consent');
select is((select count(*) from public.privacy_requests), 0::bigint, 'unrelated user cannot read privacy request');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select is((select count(*) from public.bookings), 1::bigint, 'subject can read booking');
select is((select count(*) from public.documentation), 1::bigint, 'subject can read documentation');
select is((select count(*) from public.consents), 1::bigint, 'subject can read consent');
select is((select count(*) from public.privacy_requests), 1::bigint, 'subject can read privacy request');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000005', true);
select is((select count(*) from public.bookings), 1::bigint, 'related provider can read booking');
select is((select count(*) from public.documentation), 1::bigint, 'related provider can read documentation');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000006', true);
select is((select count(*) from public.incidents), 0::bigint, 'cross-household booking provider cannot read incident');
select is((select count(*) from public.complaints), 0::bigint, 'cross-household booking provider cannot read complaint');

reset role;
select * from finish();
rollback;
