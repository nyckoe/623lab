-- Fictional demonstration records only. UUIDs are deterministic for repeatable local setup.
-- Create matching auth.users records before loading this optional seed.
insert into public.organizations (id, name, organization_type, status) values
  ('00000000-0000-0000-0000-000000000401', 'Harbor Home Support', 'provider', 'active'),
  ('00000000-0000-0000-0000-000000000402', 'Fictional Community Health Plan', 'payer', 'active')
on conflict (id) do nothing;

insert into public.profiles (id, organization_id, role, display_name) values
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000401', 'professional', 'Jordan Ellis'),
  ('00000000-0000-0000-0000-000000000201', null, 'service_receiver', 'Maya Chen'),
  ('00000000-0000-0000-0000-000000000202', null, 'representative', 'Sam Chen')
on conflict (id) do nothing;

insert into public.identities (
  id, user_id, verification_status, source, verification_method, verified_at, last_checked_at
) values
  ('00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000101', 'verified', 'demo seed', 'manual demo review', now(), now()),
  ('00000000-0000-0000-0000-000000000502', '00000000-0000-0000-0000-000000000201', 'verified', 'demo seed', 'manual demo review', now(), now()),
  ('00000000-0000-0000-0000-000000000503', '00000000-0000-0000-0000-000000000202', 'verified', 'demo seed', 'manual demo review', now(), now())
on conflict (id) do nothing;

insert into public.jurisdictions (code, country_code, name) values
  ('NY', 'US', 'New York')
on conflict (code) do nothing;

insert into public.services (code, name, regulated) values
  ('personal-care', 'Personal care', true),
  ('respite-support', 'Respite support', true)
on conflict (code) do nothing;

insert into public.qualification_tracks (
  id, role, jurisdiction_code, service_code, title, requirements
) values (
  '00000000-0000-0000-0000-000000000601', 'home_health_aide', 'NY', 'personal-care',
  'New York home health aide — personal care',
  '{"identity":true,"credential":true,"background_check":true}'::jsonb
) on conflict (id) do nothing;

insert into public.qualification_verifications (
  id, track_id, provider_user_id, status, source, verification_method,
  effective_at, expires_at, last_checked_at
) values (
  '00000000-0000-0000-0000-000000000701',
  '00000000-0000-0000-0000-000000000601',
  '00000000-0000-0000-0000-000000000101',
  'verified', 'demo seed', 'manual demo review',
  now() - interval '1 year', now() + interval '1 year', now()
) on conflict (id) do nothing;

insert into public.credentials (
  id, provider_user_id, credential_type, jurisdiction, issuer, source,
  verification_method, status, effective_at, expires_at, last_checked_at, service_scope
) values (
  '00000000-0000-0000-0000-000000000301',
  '00000000-0000-0000-0000-000000000101',
  'Home Health Aide', 'NY', 'Fictional Training Program', 'demo seed',
  'manual demo review', 'valid', now() - interval '1 year', now() + interval '1 year', now(),
  array['personal-care','respite-support']
) on conflict (id) do nothing;

insert into public.provider_scopes (
  id, provider_user_id, service_code, jurisdiction, payer_status, marketplace_active
) values (
  '00000000-0000-0000-0000-000000000702',
  '00000000-0000-0000-0000-000000000101',
  'personal-care', 'NY', 'ready', true
) on conflict (id) do nothing;

insert into public.availability (
  id, provider_user_id, service_code, jurisdiction_code, starts_at, ends_at
) values (
  '00000000-0000-0000-0000-000000000801',
  '00000000-0000-0000-0000-000000000101',
  'personal-care', 'NY', now() + interval '2 days', now() + interval '2 days 4 hours'
) on conflict (id) do nothing;

insert into public.payer_plans (
  id, organization_id, payer_name, plan_label, jurisdiction_code, network_status
) values (
  '00000000-0000-0000-0000-000000000901',
  '00000000-0000-0000-0000-000000000402',
  'Fictional Community Health Plan', 'Community Choice Demo', 'NY', 'open'
) on conflict (id) do nothing;

insert into public.dependents (
  id, owner_user_id, display_name, relationship_label
) values (
  '00000000-0000-0000-0000-000000000211',
  '00000000-0000-0000-0000-000000000201',
  'Alex Chen', 'parent'
) on conflict (id) do nothing;

insert into public.representatives (
  id, user_id, subject_user_id, dependent_id, authority_type
) values (
  '00000000-0000-0000-0000-000000000411',
  '00000000-0000-0000-0000-000000000202',
  '00000000-0000-0000-0000-000000000201',
  '00000000-0000-0000-0000-000000000211',
  'fictional guardian demo'
) on conflict (id) do nothing;

update public.dependents
set representative_id = '00000000-0000-0000-0000-000000000411'
where id = '00000000-0000-0000-0000-000000000211'
  and representative_id is distinct from '00000000-0000-0000-0000-000000000411';

do $seed$
begin
  if exists (
    select 1 from public.representatives
    where id = '00000000-0000-0000-0000-000000000411'
      and verified_at is null and revoked_at is null
  ) then
    perform public.transition_representative_authority(
      '00000000-0000-0000-0000-000000000411',
      'verify',
      array['care','coverage','consent','privacy'],
      'seed:ckare-demo'
    );
  end if;
end;
$seed$;

insert into public.coverage_checks (
  id, subject_user_id, dependent_id, payer_plan_id, payer_name, plan_label
) values (
  '00000000-0000-0000-0000-000000001001',
  '00000000-0000-0000-0000-000000000201',
  '00000000-0000-0000-0000-000000000211',
  '00000000-0000-0000-0000-000000000901',
  'Fictional Community Health Plan', 'Community Choice Demo'
) on conflict (id) do nothing;

do $seed$
begin
  if exists (
    select 1 from public.coverage_checks
    where id = '00000000-0000-0000-0000-000000001001'
      and coverage_status = 'pending'
  ) then
    perform public.record_coverage_determination(
      '00000000-0000-0000-0000-000000001001',
      'active', 'found', 'in_network', 3500, now(), 'demo-v1', 'seed:ckare-demo'
    );
  end if;
end;
$seed$;

insert into public.authorizations (
  id, coverage_check_id, service_code
) values (
  '00000000-0000-0000-0000-000000001002',
  '00000000-0000-0000-0000-000000001001',
  'personal-care'
) on conflict (id) do nothing;

do $seed$
begin
  if exists (
    select 1 from public.authorizations
    where id = '00000000-0000-0000-0000-000000001002'
      and status = 'pending'
  ) then
    perform public.transition_authorization_status(
      '00000000-0000-0000-0000-000000001002',
      'approved', 'DEMO-AUTH-42', current_date, current_date + 30, 'seed:ckare-demo'
    );
  end if;
end;
$seed$;

insert into public.matches (
  id, requester_user_id, subject_user_id, dependent_id, provider_user_id,
  service_code, status, rationale
) values (
  '00000000-0000-0000-0000-000000001101',
  '00000000-0000-0000-0000-000000000202',
  '00000000-0000-0000-0000-000000000201',
  '00000000-0000-0000-0000-000000000211',
  '00000000-0000-0000-0000-000000000101',
  'personal-care', 'accepted', '{"demo":"qualified and available"}'::jsonb
) on conflict (id) do nothing;

insert into public.bookings (
  id, requester_user_id, subject_user_id, provider_user_id, dependent_id,
  authorization_id, service_code, starts_at, status, payment_path,
  estimated_responsibility_cents, idempotency_key
) values (
  '00000000-0000-0000-0000-000000001201',
  '00000000-0000-0000-0000-000000000202',
  '00000000-0000-0000-0000-000000000201',
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000211',
  '00000000-0000-0000-0000-000000001002',
  'personal-care', now() + interval '2 days', 'confirmed', 'insurance', 3500,
  'demo-booking-001'
) on conflict (id) do nothing;

insert into public.visits (id, booking_id) values (
  '00000000-0000-0000-0000-000000001301',
  '00000000-0000-0000-0000-000000001201'
) on conflict (id) do nothing;

insert into public.documentation (
  id, visit_id, author_user_id, status, content, signed_at
) values (
  '00000000-0000-0000-0000-000000001401',
  '00000000-0000-0000-0000-000000001301',
  '00000000-0000-0000-0000-000000000101',
  'signed', '{"summary":"Fictional demo visit note"}'::jsonb, now()
) on conflict (id) do nothing;

insert into public.claims (
  id, booking_id, provider_user_id, status, billed_cents, allowed_cents,
  paid_cents, idempotency_key
) values (
  '00000000-0000-0000-0000-000000001501',
  '00000000-0000-0000-0000-000000001201',
  '00000000-0000-0000-0000-000000000101',
  'paid', 12000, 10000, 10000, 'demo-claim-001'
) on conflict (id) do nothing;

insert into public.remittances (
  id, claim_id, payer_plan_id, reference, amount_cents, status, received_at
) values (
  '00000000-0000-0000-0000-000000001601',
  '00000000-0000-0000-0000-000000001501',
  '00000000-0000-0000-0000-000000000901',
  'DEMO-ERA-001', 10000, 'posted', now()
) on conflict (id) do nothing;

insert into public.incidents (
  id, booking_id, reporter_user_id, subject_user_id, dependent_id, severity, description
) values (
  '00000000-0000-0000-0000-000000001701',
  '00000000-0000-0000-0000-000000001201',
  '00000000-0000-0000-0000-000000000202',
  '00000000-0000-0000-0000-000000000201',
  '00000000-0000-0000-0000-000000000211',
  'low', 'Fictional demonstration incident; no real person or event.'
) on conflict (id) do nothing;

insert into public.complaints (
  id, complainant_user_id, subject_user_id, dependent_id, booking_id, description
) values (
  '00000000-0000-0000-0000-000000001801',
  '00000000-0000-0000-0000-000000000202',
  '00000000-0000-0000-0000-000000000201',
  '00000000-0000-0000-0000-000000000211',
  '00000000-0000-0000-0000-000000001201',
  'Fictional demonstration complaint; no real person or event.'
) on conflict (id) do nothing;

insert into public.privacy_requests (
  id, user_id, subject_user_id, dependent_id, request_type
) values (
  '00000000-0000-0000-0000-000000001901',
  '00000000-0000-0000-0000-000000000202',
  '00000000-0000-0000-0000-000000000201',
  '00000000-0000-0000-0000-000000000211',
  'export'
) on conflict (id) do nothing;
