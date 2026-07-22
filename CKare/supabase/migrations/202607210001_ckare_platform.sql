create extension if not exists pgcrypto;

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  organization_type text not null check (organization_type in ('provider','payer','training','community')),
  status text not null default 'active' check (status in ('pending','active','suspended','closed')),
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  role text not null default 'service_receiver' check (role in ('professional','service_receiver','representative','operator')),
  display_name text not null,
  locale text not null default 'en-US',
  created_at timestamptz not null default now()
);

create table public.identities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  verification_status text not null default 'unverified' check (verification_status in ('unverified','pending','verified','failed','expired')),
  source text,
  verification_method text,
  verified_at timestamptz,
  last_checked_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.representatives (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subject_user_id uuid not null references public.profiles(id) on delete cascade,
  dependent_id uuid,
  authority_type text not null,
  allowed_purposes text[] not null default '{}',
  verified_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.dependents (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  representative_id uuid references public.representatives(id) on delete set null,
  display_name text not null,
  relationship_label text not null,
  created_at timestamptz not null default now()
);

alter table public.representatives
  add constraint representatives_dependent_id_fkey
  foreign key (dependent_id) references public.dependents(id) on delete cascade;

create table public.jurisdictions (
  code text primary key,
  country_code text not null default 'US',
  name text not null,
  active boolean not null default true
);

create table public.services (
  code text primary key,
  name text not null,
  regulated boolean not null default true,
  active boolean not null default true
);

create table public.qualification_tracks (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  jurisdiction_code text not null references public.jurisdictions(code),
  service_code text not null references public.services(code),
  title text not null,
  requirements jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  unique (role, jurisdiction_code, service_code)
);

create table public.qualification_verifications (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references public.qualification_tracks(id) on delete cascade,
  provider_user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null check (status in ('pending','verified','failed','expired','revoked')),
  source text not null,
  verification_method text not null,
  effective_at timestamptz,
  expires_at timestamptz,
  last_checked_at timestamptz,
  unique (track_id, provider_user_id)
);

create table public.credentials (
  id uuid primary key default gen_random_uuid(),
  provider_user_id uuid not null references public.profiles(id) on delete cascade,
  credential_type text not null,
  jurisdiction text not null,
  issuer text not null,
  source text not null,
  verification_method text not null,
  status text not null check (status in ('unverified','valid','expired','suspended','under_review')),
  effective_at timestamptz,
  expires_at timestamptz,
  last_checked_at timestamptz,
  service_scope text[] not null default '{}'
);

create table public.provider_scopes (
  id uuid primary key default gen_random_uuid(),
  provider_user_id uuid not null references public.profiles(id) on delete cascade,
  service_code text not null,
  jurisdiction text not null,
  payer_status text not null check (payer_status in ('not_required','pending','ready','suspended')),
  marketplace_active boolean not null default false,
  unique (provider_user_id, service_code, jurisdiction)
);

create table public.availability (
  id uuid primary key default gen_random_uuid(),
  provider_user_id uuid not null references public.profiles(id) on delete cascade,
  service_code text not null references public.services(code),
  jurisdiction_code text not null references public.jurisdictions(code),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'available' check (status in ('available','held','booked','cancelled')),
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table public.payer_plans (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete set null,
  payer_name text not null,
  plan_label text not null,
  jurisdiction_code text not null references public.jurisdictions(code),
  network_status text not null default 'unknown' check (network_status in ('unknown','open','closed')),
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.coverage_checks (
  id uuid primary key default gen_random_uuid(),
  subject_user_id uuid not null references public.profiles(id) on delete cascade,
  dependent_id uuid references public.dependents(id) on delete cascade,
  payer_plan_id uuid references public.payer_plans(id) on delete set null,
  payer_name text not null,
  plan_label text,
  coverage_status text not null default 'pending' check (coverage_status in ('pending','active','inactive','unable_to_verify')),
  benefit_status text not null default 'pending' check (benefit_status in ('pending','found','not_found','unable_to_verify')),
  network_status text not null default 'unknown' check (network_status in ('unknown','in_network','out_of_network','unable_to_verify')),
  estimate_cents integer check (estimate_cents is null or estimate_cents >= 0),
  checked_at timestamptz not null default now(),
  disclosure_version text not null default 'pending'
);

create table public.authorizations (
  id uuid primary key default gen_random_uuid(),
  coverage_check_id uuid not null references public.coverage_checks(id) on delete cascade,
  service_code text not null,
  status text not null default 'pending' check (status in ('not_required','pending','approved','denied','expired')),
  reference text,
  valid_from timestamptz,
  valid_until timestamptz
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  requester_user_id uuid not null references public.profiles(id),
  subject_user_id uuid not null references public.profiles(id),
  dependent_id uuid references public.dependents(id),
  provider_user_id uuid not null references public.profiles(id),
  service_code text not null references public.services(code),
  status text not null default 'candidate' check (status in ('candidate','offered','accepted','declined','expired')),
  rationale jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  requester_user_id uuid not null references public.profiles(id),
  subject_user_id uuid not null references public.profiles(id),
  provider_user_id uuid not null references public.profiles(id),
  dependent_id uuid references public.dependents(id),
  authorization_id uuid references public.authorizations(id),
  service_code text not null,
  starts_at timestamptz not null,
  status text not null default 'requested' check (status in ('requested','confirmed','in_progress','completed','cancelled','no_show')),
  payment_path text not null check (payment_path in ('insurance','private_pay','program')),
  estimated_responsibility_cents integer check (estimated_responsibility_cents is null or estimated_responsibility_cents >= 0),
  idempotency_key text not null unique,
  created_at timestamptz not null default now()
);

create table public.visits (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  check_in_at timestamptz,
  check_out_at timestamptz,
  documentation_status text not null default 'not_started',
  incident_reported boolean not null default false,
  amended_at timestamptz
);

create table public.documentation (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid not null references public.visits(id) on delete cascade,
  author_user_id uuid not null references public.profiles(id),
  status text not null default 'draft' check (status in ('draft','signed','amended','void')),
  content jsonb not null default '{}'::jsonb,
  signed_at timestamptz,
  amended_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.claims (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id),
  provider_user_id uuid not null references public.profiles(id),
  status text not null check (status in ('draft','submitted','accepted','pending','denied','appealed','paid','adjusted','recouped')),
  billed_cents integer not null,
  allowed_cents integer,
  paid_cents integer,
  denial_reason text,
  idempotency_key text not null unique,
  updated_at timestamptz not null default now()
);

create table public.remittances (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references public.claims(id) on delete cascade,
  payer_plan_id uuid references public.payer_plans(id) on delete set null,
  reference text not null,
  amount_cents integer not null,
  status text not null check (status in ('received','posted','adjusted','reversed')),
  received_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.payouts (
  id uuid primary key default gen_random_uuid(),
  provider_user_id uuid not null references public.profiles(id),
  claim_id uuid references public.claims(id),
  amount_cents integer not null,
  status text not null check (status in ('estimated','scheduled','paid','failed','reversed')),
  estimated_at timestamptz,
  paid_at timestamptz
);

create table public.consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subject_user_id uuid references public.profiles(id) on delete cascade,
  dependent_id uuid references public.dependents(id) on delete cascade,
  consent_type text not null,
  document_version text not null,
  granted_at timestamptz not null,
  revoked_at timestamptz
);

create table public.incidents (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete set null,
  reporter_user_id uuid not null references public.profiles(id),
  subject_user_id uuid not null references public.profiles(id),
  dependent_id uuid references public.dependents(id),
  severity text not null check (severity in ('low','moderate','high','critical')),
  status text not null default 'reported' check (status in ('reported','triaged','investigating','resolved','closed')),
  description text not null,
  created_at timestamptz not null default now()
);

create table public.complaints (
  id uuid primary key default gen_random_uuid(),
  complainant_user_id uuid not null references public.profiles(id),
  subject_user_id uuid not null references public.profiles(id),
  dependent_id uuid references public.dependents(id),
  booking_id uuid references public.bookings(id) on delete set null,
  status text not null default 'received' check (status in ('received','reviewing','resolved','closed')),
  description text not null,
  created_at timestamptz not null default now()
);

create table public.privacy_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subject_user_id uuid references public.profiles(id) on delete cascade,
  dependent_id uuid references public.dependents(id) on delete cascade,
  request_type text not null check (request_type in ('export','delete')),
  status text not null default 'received' check (status in ('received','identity_check','processing','completed','rejected')),
  requested_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.audit_events (
  id bigint generated always as identity primary key,
  actor_user_id uuid references public.profiles(id),
  actor_identity text not null check (btrim(actor_identity) <> ''),
  subject_type text not null,
  subject_id text not null,
  action text not null,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create or replace function public.subject_matches_dependent(
  p_subject_user_id uuid,
  p_dependent_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select p_dependent_id is null or exists (
    select 1
    from public.dependents d
    where d.id = p_dependent_id
      and d.owner_user_id = p_subject_user_id
  );
$function$;

revoke all on function public.subject_matches_dependent(uuid, uuid) from public, anon;
grant execute on function public.subject_matches_dependent(uuid, uuid) to authenticated, service_role;

create or replace function public.has_verified_representative_access(
  p_subject_user_id uuid,
  p_dependent_id uuid,
  p_purpose text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.representatives r
    where r.user_id = (select auth.uid())
      and r.subject_user_id = p_subject_user_id
      and r.verified_at is not null
      and r.revoked_at is null
      and r.dependent_id is not distinct from p_dependent_id
      and p_purpose = any (r.allowed_purposes)
      and public.subject_matches_dependent(r.subject_user_id, r.dependent_id)
  );
$function$;

revoke all on function public.has_verified_representative_access(uuid, uuid, text) from public, anon;
grant execute on function public.has_verified_representative_access(uuid, uuid, text) to authenticated, service_role;

drop function if exists public.transition_profile_role(uuid, text);
create or replace function public.transition_profile_role(
  p_profile_id uuid,
  p_role text,
  p_actor_identity text
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_previous_role text;
begin
  if p_role not in ('professional','service_receiver','representative','operator') then
    raise exception 'invalid profile role';
  end if;

  select role into v_previous_role
  from public.profiles
  where id = p_profile_id
  for update;
  if not found then
    raise exception 'profile not found';
  end if;

  update public.profiles set role = p_role where id = p_profile_id;
  insert into public.audit_events (actor_user_id, actor_identity, subject_type, subject_id, action, metadata)
  values (auth.uid(), p_actor_identity, 'profile', p_profile_id::text, 'profile.role.transitioned',
    jsonb_build_object('from', v_previous_role, 'to', p_role));
end;
$function$;

drop function if exists public.transition_representative_authority(uuid, text, text[]);
create or replace function public.transition_representative_authority(
  p_representative_id uuid,
  p_action text,
  p_allowed_purposes text[],
  p_actor_identity text
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_authority public.representatives%rowtype;
begin
  if p_action not in ('verify','revoke') then
    raise exception 'invalid representative authority action';
  end if;

  select * into v_authority
  from public.representatives
  where id = p_representative_id
  for update;
  if not found then
    raise exception 'representative authority not found';
  end if;

  if v_authority.dependent_id is not null and not exists (
    select 1 from public.dependents d
    where d.id = v_authority.dependent_id
      and d.owner_user_id = v_authority.subject_user_id
  ) then
    raise exception 'representative authority subject does not own dependent';
  end if;

  if p_action = 'verify' then
    if coalesce(cardinality(p_allowed_purposes), 0) = 0
      or not (p_allowed_purposes <@ array['care','coverage','consent','privacy']::text[]) then
      raise exception 'at least one recognized authority purpose is required';
    end if;
    update public.representatives
    set verified_at = clock_timestamp(), revoked_at = null, allowed_purposes = p_allowed_purposes
    where id = p_representative_id;
  else
    update public.representatives
    set revoked_at = clock_timestamp()
    where id = p_representative_id;
  end if;

  insert into public.audit_events (actor_user_id, actor_identity, subject_type, subject_id, action, metadata)
  values (auth.uid(), p_actor_identity, 'representative', p_representative_id::text,
    'representative.authority.' || p_action,
    jsonb_build_object('subject_user_id', v_authority.subject_user_id,
      'dependent_id', v_authority.dependent_id,
      'allowed_purposes', coalesce(p_allowed_purposes, v_authority.allowed_purposes)));
end;
$function$;

drop function if exists public.record_coverage_determination(uuid, text, text, text, integer, timestamptz, text);
create or replace function public.record_coverage_determination(
  p_coverage_check_id uuid,
  p_coverage_status text,
  p_benefit_status text,
  p_network_status text,
  p_estimate_cents integer,
  p_checked_at timestamptz,
  p_disclosure_version text,
  p_actor_identity text
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_previous jsonb;
begin
  if p_coverage_status is null
    or p_coverage_status not in ('pending','active','inactive','unable_to_verify') then
    raise exception 'invalid coverage status';
  end if;
  if p_benefit_status is null
    or p_benefit_status not in ('pending','found','not_found','unable_to_verify') then
    raise exception 'invalid benefit status';
  end if;
  if p_network_status is null
    or p_network_status not in ('unknown','in_network','out_of_network','unable_to_verify') then
    raise exception 'invalid network status';
  end if;
  if p_estimate_cents is not null and p_estimate_cents < 0 then
    raise exception 'coverage estimate cannot be negative';
  end if;

  select jsonb_build_object(
    'coverage_status', coverage_status,
    'benefit_status', benefit_status,
    'network_status', network_status,
    'estimate_cents', estimate_cents
  ) into v_previous
  from public.coverage_checks
  where id = p_coverage_check_id
  for update;
  if not found then
    raise exception 'coverage check not found';
  end if;

  update public.coverage_checks
  set coverage_status = p_coverage_status,
      benefit_status = p_benefit_status,
      network_status = p_network_status,
      estimate_cents = p_estimate_cents,
      checked_at = p_checked_at,
      disclosure_version = p_disclosure_version
  where id = p_coverage_check_id;

  insert into public.audit_events (actor_user_id, actor_identity, subject_type, subject_id, action, metadata)
  values (auth.uid(), p_actor_identity, 'coverage_check', p_coverage_check_id::text, 'coverage.determination.recorded',
    jsonb_build_object('from', v_previous, 'to', jsonb_build_object(
      'coverage_status', p_coverage_status,
      'benefit_status', p_benefit_status,
      'network_status', p_network_status,
      'estimate_cents', p_estimate_cents,
      'checked_at', p_checked_at,
      'disclosure_version', p_disclosure_version)));
end;
$function$;

drop function if exists public.transition_authorization_status(uuid, text, text, timestamptz, timestamptz);
create or replace function public.transition_authorization_status(
  p_authorization_id uuid,
  p_status text,
  p_reference text,
  p_valid_from timestamptz,
  p_valid_until timestamptz,
  p_actor_identity text
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_previous_status text;
begin
  if p_status not in ('not_required','pending','approved','denied','expired') then
    raise exception 'invalid authorization status';
  end if;

  select status into v_previous_status
  from public.authorizations
  where id = p_authorization_id
  for update;
  if not found then
    raise exception 'authorization not found';
  end if;

  update public.authorizations
  set status = p_status, reference = p_reference, valid_from = p_valid_from, valid_until = p_valid_until
  where id = p_authorization_id;

  insert into public.audit_events (actor_user_id, actor_identity, subject_type, subject_id, action, metadata)
  values (auth.uid(), p_actor_identity, 'authorization', p_authorization_id::text, 'authorization.status.transitioned',
    jsonb_build_object('from', v_previous_status, 'to', p_status,
      'reference', p_reference, 'valid_from', p_valid_from, 'valid_until', p_valid_until));
end;
$function$;

drop function if exists public.transition_privacy_request_status(uuid, text);
create or replace function public.transition_privacy_request_status(
  p_privacy_request_id uuid,
  p_status text,
  p_actor_identity text
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_previous_status text;
begin
  select status into v_previous_status
  from public.privacy_requests
  where id = p_privacy_request_id
  for update;
  if not found then
    raise exception 'privacy request not found';
  end if;

  if not (
    (v_previous_status = 'received' and p_status in ('identity_check','rejected'))
    or (v_previous_status = 'identity_check' and p_status in ('processing','rejected'))
    or (v_previous_status = 'processing' and p_status in ('completed','rejected'))
  ) then
    raise exception 'invalid privacy request transition from % to %', v_previous_status, p_status;
  end if;

  update public.privacy_requests
  set status = p_status,
      completed_at = case when p_status = 'completed' then clock_timestamp() else null end
  where id = p_privacy_request_id;

  insert into public.audit_events (actor_user_id, actor_identity, subject_type, subject_id, action, metadata)
  values (auth.uid(), p_actor_identity, 'privacy_request', p_privacy_request_id::text, 'privacy_request.status.transitioned',
    jsonb_build_object('from', v_previous_status, 'to', p_status));
end;
$function$;

revoke all on function public.transition_profile_role(uuid, text, text) from public, anon, authenticated;
grant execute on function public.transition_profile_role(uuid, text, text) to service_role;
revoke all on function public.transition_representative_authority(uuid, text, text[], text) from public, anon, authenticated;
grant execute on function public.transition_representative_authority(uuid, text, text[], text) to service_role;
revoke all on function public.record_coverage_determination(uuid, text, text, text, integer, timestamptz, text, text) from public, anon, authenticated;
grant execute on function public.record_coverage_determination(uuid, text, text, text, integer, timestamptz, text, text) to service_role;
revoke all on function public.transition_authorization_status(uuid, text, text, timestamptz, timestamptz, text) from public, anon, authenticated;
grant execute on function public.transition_authorization_status(uuid, text, text, timestamptz, timestamptz, text) to service_role;
revoke all on function public.transition_privacy_request_status(uuid, text, text) from public, anon, authenticated;
grant execute on function public.transition_privacy_request_status(uuid, text, text) to service_role;

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.identities enable row level security;
alter table public.representatives enable row level security;
alter table public.dependents enable row level security;
alter table public.jurisdictions enable row level security;
alter table public.qualification_tracks enable row level security;
alter table public.qualification_verifications enable row level security;
alter table public.credentials enable row level security;
alter table public.services enable row level security;
alter table public.provider_scopes enable row level security;
alter table public.availability enable row level security;
alter table public.payer_plans enable row level security;
alter table public.coverage_checks enable row level security;
alter table public.authorizations enable row level security;
alter table public.matches enable row level security;
alter table public.bookings enable row level security;
alter table public.visits enable row level security;
alter table public.documentation enable row level security;
alter table public.claims enable row level security;
alter table public.remittances enable row level security;
alter table public.payouts enable row level security;
alter table public.consents enable row level security;
alter table public.incidents enable row level security;
alter table public.complaints enable row level security;
alter table public.privacy_requests enable row level security;
alter table public.audit_events enable row level security;

create policy "active organizations read" on public.organizations for select to authenticated
  using (status = 'active');
create policy "profile owner read" on public.profiles for select to authenticated
  using (id = auth.uid());
create policy "profile owner create" on public.profiles for insert to authenticated
  with check (id = auth.uid());
create policy "profile owner update" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy "identity owner read" on public.identities for select to authenticated
  using (user_id = auth.uid());
create policy "representative authority read" on public.representatives for select to authenticated
  using (user_id = auth.uid() or subject_user_id = auth.uid());
create policy "representative authority create" on public.representatives for insert to authenticated
  with check (user_id = auth.uid());
create policy "dependent authorized read" on public.dependents for select to authenticated
  using (
    owner_user_id = auth.uid()
    or public.has_verified_representative_access(owner_user_id, id, 'care')
  );
create policy "dependent owner create" on public.dependents for insert to authenticated
  with check (owner_user_id = auth.uid());
create policy "active jurisdictions read" on public.jurisdictions for select to authenticated
  using (active);
create policy "active qualification tracks read" on public.qualification_tracks for select to authenticated
  using (active);
create policy "qualification verification owner read" on public.qualification_verifications for select to authenticated
  using (provider_user_id = auth.uid());
create policy "credential owner read" on public.credentials for select to authenticated
  using (provider_user_id = auth.uid());
create policy "active services read" on public.services for select to authenticated
  using (active);
create policy "provider scope owner read" on public.provider_scopes for select to authenticated
  using (provider_user_id = auth.uid());
create policy "availability owner read" on public.availability for select to authenticated
  using (provider_user_id = auth.uid());
create policy "availability owner create" on public.availability for insert to authenticated
  with check (provider_user_id = auth.uid());
create policy "active payer plans read" on public.payer_plans for select to authenticated
  using (active);
create policy "coverage authorized read" on public.coverage_checks for select to authenticated
  using (
    public.subject_matches_dependent(subject_user_id, dependent_id)
    and (
      subject_user_id = auth.uid()
      or public.has_verified_representative_access(subject_user_id, dependent_id, 'coverage')
    )
  );
create policy "coverage request create" on public.coverage_checks for insert to authenticated
  with check (
    public.subject_matches_dependent(subject_user_id, dependent_id)
    and (
      subject_user_id = auth.uid()
      or public.has_verified_representative_access(subject_user_id, dependent_id, 'coverage')
    )
  );
create policy "authorization through coverage read" on public.authorizations for select to authenticated
  using (exists (
    select 1 from public.coverage_checks c
    where c.id = coverage_check_id
      and public.subject_matches_dependent(c.subject_user_id, c.dependent_id)
      and (
        c.subject_user_id = auth.uid()
        or public.has_verified_representative_access(c.subject_user_id, c.dependent_id, 'coverage')
      )
  ));
create policy "match party read" on public.matches for select to authenticated
  using (
    public.subject_matches_dependent(subject_user_id, dependent_id)
    and (
      subject_user_id = auth.uid()
      or provider_user_id = auth.uid()
      or public.has_verified_representative_access(subject_user_id, dependent_id, 'care')
    )
  );
create policy "booking party read" on public.bookings for select to authenticated
  using (
    public.subject_matches_dependent(subject_user_id, dependent_id)
    and (
      subject_user_id = auth.uid()
      or provider_user_id = auth.uid()
      or public.has_verified_representative_access(subject_user_id, dependent_id, 'care')
    )
  );
create policy "booking requester create" on public.bookings for insert to authenticated
  with check (
    requester_user_id = auth.uid()
    and public.subject_matches_dependent(subject_user_id, dependent_id)
    and (
      subject_user_id = auth.uid()
      or public.has_verified_representative_access(subject_user_id, dependent_id, 'care')
    )
  );
create policy "visit party read" on public.visits for select to authenticated
  using (exists (
    select 1 from public.bookings b
    where b.id = booking_id
      and (
        b.subject_user_id = auth.uid()
        or b.provider_user_id = auth.uid()
        or public.has_verified_representative_access(b.subject_user_id, b.dependent_id, 'care')
      )
  ));
create policy "documentation party read" on public.documentation for select to authenticated
  using (exists (
    select 1 from public.visits v
    join public.bookings b on b.id = v.booking_id
    where v.id = visit_id
      and (
        b.subject_user_id = auth.uid()
        or b.provider_user_id = auth.uid()
        or public.has_verified_representative_access(b.subject_user_id, b.dependent_id, 'care')
      )
  ));
create policy "documentation provider create" on public.documentation for insert to authenticated
  with check (
    author_user_id = auth.uid()
    and exists (
      select 1 from public.visits v
      join public.bookings b on b.id = v.booking_id
      where v.id = visit_id and b.provider_user_id = auth.uid()
    )
  );
create policy "claim provider read" on public.claims for select to authenticated
  using (provider_user_id = auth.uid());
create policy "remittance provider read" on public.remittances for select to authenticated
  using (exists (
    select 1 from public.claims c where c.id = claim_id and c.provider_user_id = auth.uid()
  ));
create policy "payout provider read" on public.payouts for select to authenticated
  using (provider_user_id = auth.uid());
create policy "consent authorized read" on public.consents for select to authenticated
  using (
    public.subject_matches_dependent(coalesce(subject_user_id, user_id), dependent_id)
    and (
      coalesce(subject_user_id, user_id) = auth.uid()
      or public.has_verified_representative_access(coalesce(subject_user_id, user_id), dependent_id, 'consent')
    )
  );
create policy "consent authorized create" on public.consents for insert to authenticated
  with check (
    user_id = auth.uid()
    and public.subject_matches_dependent(coalesce(subject_user_id, user_id), dependent_id)
    and (
      subject_user_id is null
      or subject_user_id = auth.uid()
      or public.has_verified_representative_access(subject_user_id, dependent_id, 'consent')
    )
  );
create policy "incident party read" on public.incidents for select to authenticated
  using (
    public.subject_matches_dependent(subject_user_id, dependent_id)
    and (
      subject_user_id = auth.uid()
      or exists (
        select 1 from public.bookings b
        where b.id = incidents.booking_id
          and b.subject_user_id = incidents.subject_user_id
          and b.dependent_id is not distinct from incidents.dependent_id
          and b.provider_user_id = auth.uid()
      )
      or public.has_verified_representative_access(subject_user_id, dependent_id, 'care')
    )
  );
create policy "incident reporter create" on public.incidents for insert to authenticated
  with check (
    reporter_user_id = auth.uid()
    and public.subject_matches_dependent(subject_user_id, dependent_id)
    and (
      booking_id is null
      or exists (
        select 1 from public.bookings b
        where b.id = incidents.booking_id
          and b.subject_user_id = incidents.subject_user_id
          and b.dependent_id is not distinct from incidents.dependent_id
      )
    )
    and (
      subject_user_id = auth.uid()
      or public.has_verified_representative_access(subject_user_id, dependent_id, 'care')
    )
  );
create policy "complaint party read" on public.complaints for select to authenticated
  using (
    public.subject_matches_dependent(subject_user_id, dependent_id)
    and (
      subject_user_id = auth.uid()
      or exists (
        select 1 from public.bookings b
        where b.id = complaints.booking_id
          and b.subject_user_id = complaints.subject_user_id
          and b.dependent_id is not distinct from complaints.dependent_id
          and b.provider_user_id = auth.uid()
      )
      or public.has_verified_representative_access(subject_user_id, dependent_id, 'care')
    )
  );
create policy "complaint create" on public.complaints for insert to authenticated
  with check (
    complainant_user_id = auth.uid()
    and public.subject_matches_dependent(subject_user_id, dependent_id)
    and (
      booking_id is null
      or exists (
        select 1 from public.bookings b
        where b.id = complaints.booking_id
          and b.subject_user_id = complaints.subject_user_id
          and b.dependent_id is not distinct from complaints.dependent_id
      )
    )
    and (
      subject_user_id = auth.uid()
      or public.has_verified_representative_access(subject_user_id, dependent_id, 'care')
    )
  );
create policy "privacy request authorized read" on public.privacy_requests for select to authenticated
  using (
    public.subject_matches_dependent(coalesce(subject_user_id, user_id), dependent_id)
    and (
      coalesce(subject_user_id, user_id) = auth.uid()
      or public.has_verified_representative_access(coalesce(subject_user_id, user_id), dependent_id, 'privacy')
    )
  );
create policy "privacy request create" on public.privacy_requests for insert to authenticated
  with check (
    user_id = auth.uid()
    and public.subject_matches_dependent(coalesce(subject_user_id, user_id), dependent_id)
    and (
      subject_user_id is null
      or subject_user_id = auth.uid()
      or public.has_verified_representative_access(subject_user_id, dependent_id, 'privacy')
    )
  );

revoke all on public.profiles from anon, authenticated, service_role;
grant select on public.profiles to authenticated, service_role;
grant insert (id, display_name, locale) on public.profiles to authenticated;
grant update (display_name, locale) on public.profiles to authenticated;
grant insert (id, organization_id, display_name, locale, created_at) on public.profiles to service_role;
grant delete on public.profiles to service_role;
grant update (organization_id, display_name, locale, created_at) on public.profiles to service_role;

revoke all on public.representatives from anon, authenticated, service_role;
grant select on public.representatives to authenticated, service_role;
grant insert (user_id, subject_user_id, dependent_id, authority_type) on public.representatives to authenticated;
grant insert (user_id, subject_user_id, dependent_id, authority_type, created_at) on public.representatives to service_role;

revoke all on public.coverage_checks from anon, authenticated, service_role;
grant select on public.coverage_checks to authenticated, service_role;
grant insert (subject_user_id, dependent_id, payer_plan_id, payer_name, plan_label) on public.coverage_checks to authenticated;
grant insert (subject_user_id, dependent_id, payer_plan_id, payer_name, plan_label) on public.coverage_checks to service_role;

revoke all on public.authorizations from anon, authenticated, service_role;
grant select on public.authorizations to authenticated, service_role;
grant insert (coverage_check_id, service_code) on public.authorizations to service_role;

revoke all on public.privacy_requests from anon, authenticated, service_role;
grant select on public.privacy_requests to authenticated, service_role;
grant insert (user_id, subject_user_id, dependent_id, request_type) on public.privacy_requests to authenticated;
grant insert (user_id, subject_user_id, dependent_id, request_type, requested_at) on public.privacy_requests to service_role;

revoke all on public.organizations, public.identities, public.dependents, public.jurisdictions,
  public.qualification_tracks, public.qualification_verifications, public.credentials, public.services,
  public.provider_scopes, public.availability, public.payer_plans, public.matches, public.bookings,
  public.visits, public.documentation, public.claims, public.remittances, public.payouts, public.consents,
  public.incidents, public.complaints, public.audit_events from anon, authenticated, service_role;

grant select on public.organizations, public.identities, public.dependents, public.jurisdictions,
  public.qualification_tracks, public.qualification_verifications, public.credentials, public.services,
  public.provider_scopes, public.availability, public.payer_plans, public.matches, public.bookings,
  public.visits, public.documentation, public.claims, public.remittances, public.payouts, public.consents,
  public.incidents, public.complaints to authenticated;

grant insert (owner_user_id, display_name, relationship_label) on public.dependents to authenticated;
grant insert (provider_user_id, service_code, jurisdiction_code, starts_at, ends_at) on public.availability to authenticated;
grant insert (requester_user_id, subject_user_id, provider_user_id, dependent_id, authorization_id,
  service_code, starts_at, payment_path, idempotency_key) on public.bookings to authenticated;
grant insert (visit_id, author_user_id, content) on public.documentation to authenticated;
grant insert (user_id, subject_user_id, dependent_id, consent_type, document_version, granted_at)
  on public.consents to authenticated;
grant insert (booking_id, reporter_user_id, subject_user_id, dependent_id, severity, description)
  on public.incidents to authenticated;
grant insert (complainant_user_id, subject_user_id, dependent_id, booking_id, description)
  on public.complaints to authenticated;

grant all on public.organizations, public.identities, public.dependents, public.jurisdictions,
  public.qualification_tracks, public.qualification_verifications, public.credentials, public.services,
  public.provider_scopes, public.availability, public.payer_plans, public.matches, public.bookings,
  public.visits, public.documentation, public.claims, public.remittances, public.payouts, public.consents,
  public.incidents, public.complaints to service_role;
grant select, insert on public.audit_events to service_role;
grant usage, select on sequence public.audit_events_id_seq to service_role;

comment on function public.has_verified_representative_access(uuid, uuid, text) is
  'Fail-closed representative authorization: exact subject and dependent, verified and unrevoked authority, and an allowed purpose.';
comment on table public.audit_events is
  'Service-role audit sink. No authenticated client policy or grant is intentionally defined.';
