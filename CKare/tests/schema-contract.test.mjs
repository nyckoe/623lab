import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migrationPath = new URL("../supabase/migrations/202607210001_ckare_platform.sql", import.meta.url);
const rlsIntegrationPath = new URL("../supabase/tests/rls_authorization.sql", import.meta.url);
const supabaseReadmePath = new URL("../supabase/README.md", import.meta.url);

function policySql(sql, name) {
  const match = sql.match(new RegExp(`create policy "${name}"[\\s\\S]*?;`, "i"));
  assert.ok(match, `missing policy ${name}`);
  return match[0];
}

test("migration defines every core marketplace table", async () => {
  const sql = await readFile(migrationPath, "utf8");
  const tables = [
    "profiles", "organizations", "identities", "representatives", "dependents",
    "jurisdictions", "qualification_tracks", "qualification_verifications",
    "credentials", "services", "provider_scopes", "availability", "payer_plans",
    "coverage_checks", "authorizations", "matches", "bookings", "visits",
    "documentation", "claims", "remittances", "payouts", "consents", "incidents",
    "complaints", "privacy_requests", "audit_events",
  ];
  for (const table of tables) {
    assert.match(sql, new RegExp(`create table public\\.${table}\\b`, "i"), `missing ${table}`);
  }
});

test("every sensitive table enables row-level security", async () => {
  const sql = await readFile(migrationPath, "utf8");
  const tables = [
    "profiles", "organizations", "identities", "representatives", "dependents",
    "jurisdictions", "qualification_tracks", "qualification_verifications",
    "credentials", "services", "provider_scopes", "availability", "payer_plans",
    "coverage_checks", "authorizations", "matches", "bookings", "visits",
    "documentation", "claims", "remittances", "payouts", "consents", "incidents",
    "complaints", "privacy_requests", "audit_events",
  ];
  for (const table of tables) {
    assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`, "i"));
  }
  assert.match(sql, /auth\.uid\(\)/i);
  assert.match(sql, /idempotency_key text not null unique/i);
});

test("verified representative access fails closed on subject, verification, revocation, dependent, and purpose", async () => {
  const sql = await readFile(migrationPath, "utf8");
  assert.match(sql, /create or replace function public\.has_verified_representative_access\s*\(/i);
  assert.match(sql, /r\.user_id\s*=\s*\(select auth\.uid\(\)\)/i);
  assert.match(sql, /r\.subject_user_id\s*=\s*p_subject_user_id/i);
  assert.match(sql, /r\.verified_at is not null/i);
  assert.match(sql, /r\.revoked_at is null/i);
  assert.match(sql, /r\.dependent_id is not distinct from p_dependent_id/i);
  assert.match(sql, /p_purpose\s*=\s*any\s*\(r\.allowed_purposes\)/i);
  assert.match(sql, /security definer/i);
  assert.match(sql, /set search_path\s*=\s*''/i);
  for (const purpose of ["care", "coverage", "consent", "privacy"]) {
    assert.match(sql, new RegExp(`has_verified_representative_access\\s*\\([^;]+?'${purpose}'`, "is"));
  }
});

test("record creators cannot bypass current representative authority", async () => {
  const sql = await readFile(migrationPath, "utf8");
  const policies = [
    ["match party read", /requester_user_id/i, "care"],
    ["booking party read", /requester_user_id/i, "care"],
    ["visit party read", /requester_user_id/i, "care"],
    ["documentation party read", /requester_user_id/i, "care"],
    ["consent authorized read", /\buser_id\s*=\s*auth\.uid\(\)/i, "consent"],
    ["incident party read", /reporter_user_id\s*=\s*auth\.uid\(\)/i, "care"],
    ["complaint party read", /complainant_user_id\s*=\s*auth\.uid\(\)/i, "care"],
    ["privacy request authorized read", /\buser_id\s*=\s*auth\.uid\(\)/i, "privacy"],
  ];
  for (const [name, creatorBypass, purpose] of policies) {
    const policy = policySql(sql, name);
    assert.doesNotMatch(policy, creatorBypass, `${name} trusts record creator after authority changes`);
    assert.match(policy, new RegExp(`has_verified_representative_access\\s*\\([^;]+?'${purpose}'`, "is"));
  }
  for (const name of ["match party read", "booking party read", "visit party read", "documentation party read", "incident party read", "complaint party read"]) {
    const policy = policySql(sql, name);
    assert.match(policy, /subject_user_id\s*=\s*auth\.uid\(\)/i);
    assert.match(policy, /provider_user_id\s*=\s*auth\.uid\(\)/i);
  }
});

test("incident and complaint booking links match the record household", async () => {
  const sql = await readFile(migrationPath, "utf8");
  for (const [name, recordTable] of [
    ["incident party read", "incidents"],
    ["incident reporter create", "incidents"],
    ["complaint party read", "complaints"],
    ["complaint create", "complaints"],
  ]) {
    const policy = policySql(sql, name);
    assert.match(policy, new RegExp(`b\\.id\\s*=\\s*${recordTable}\\.booking_id`, "i"));
    assert.match(policy, new RegExp(`b\\.subject_user_id\\s*=\\s*${recordTable}\\.subject_user_id`, "i"));
    assert.match(policy, new RegExp(`b\\.dependent_id\\s+is not distinct from\\s+${recordTable}\\.dependent_id`, "i"));
  }
  for (const name of ["incident reporter create", "complaint create"]) {
    assert.match(policySql(sql, name), /booking_id is null[\s\S]+or exists/i);
  }
});

test("subject records fail closed when a dependent belongs to another household", async () => {
  const sql = await readFile(migrationPath, "utf8");
  assert.match(sql, /create or replace function public\.subject_matches_dependent\s*\(/i);
  assert.match(sql, /p_dependent_id is null[\s\S]+d\.id\s*=\s*p_dependent_id[\s\S]+d\.owner_user_id\s*=\s*p_subject_user_id/i);
  for (const table of ["coverage_checks", "bookings", "consents", "incidents", "complaints", "privacy_requests"]) {
    assert.match(sql, new RegExp(`create policy[^;]+on public\\.${table} for insert[^;]+subject_matches_dependent`, "i"));
  }
});

test("broad owner policies are replaced by read and create policies", async () => {
  const sql = await readFile(migrationPath, "utf8");
  assert.doesNotMatch(sql, /create policy[^;]+for all/i);
  for (const table of ["representatives", "dependents", "coverage_checks", "consents", "privacy_requests"]) {
    assert.match(sql, new RegExp(`create policy[^;]+on public\\.${table} for select`, "i"));
    assert.match(sql, new RegExp(`create policy[^;]+on public\\.${table} for insert`, "i"));
  }
});

test("client grants exclude server-authoritative columns", async () => {
  const sql = await readFile(migrationPath, "utf8");
  assert.match(sql, /revoke all on public\.profiles from anon, authenticated, service_role/i);
  assert.match(sql, /grant update \(display_name, locale\) on public\.profiles to authenticated/i);
  assert.doesNotMatch(sql, /grant update \([^)]*role[^)]*\) on public\.profiles to authenticated/i);

  assert.match(sql, /revoke all on public\.representatives from anon, authenticated, service_role/i);
  assert.doesNotMatch(sql, /grant (?:insert|update) \([^)]*(?:verified_at|revoked_at|allowed_purposes)[^)]*\) on public\.representatives to authenticated/i);

  assert.match(sql, /revoke all on public\.coverage_checks from anon, authenticated, service_role/i);
  assert.doesNotMatch(sql, /grant (?:insert|update) \([^)]*(?:coverage_status|benefit_status|network_status|estimate_cents)[^)]*\) on public\.coverage_checks to authenticated/i);

  assert.match(sql, /revoke all on public\.privacy_requests from anon, authenticated, service_role/i);
  assert.doesNotMatch(sql, /grant (?:insert|update) \([^)]*(?:status|completed_at)[^)]*\) on public\.privacy_requests to authenticated/i);
});

test("server-authoritative transitions are audited and executable only by the service role", async () => {
  const sql = await readFile(migrationPath, "utf8");
  const functions = [
    "transition_profile_role",
    "transition_representative_authority",
    "record_coverage_determination",
    "transition_authorization_status",
    "transition_privacy_request_status",
  ];
  for (const functionName of functions) {
    assert.match(sql, new RegExp(`create or replace function public\\.${functionName}\\s*\\(`, "i"));
    assert.match(sql, new RegExp(`revoke all on function public\\.${functionName}[^;]+from public, anon, authenticated`, "i"));
    assert.match(sql, new RegExp(`grant execute on function public\\.${functionName}[^;]+to service_role`, "i"));
  }
  assert.equal((sql.match(/security definer/gi) ?? []).length >= functions.length + 1, true);
  assert.equal((sql.match(/insert into public\.audit_events/gi) ?? []).length >= functions.length, true);
});

test("audit events are append-only and every transition requires an actor identity", async () => {
  const sql = await readFile(migrationPath, "utf8");
  assert.match(sql, /actor_identity text not null/i);
  assert.match(sql, /grant select, insert on public\.audit_events to service_role/i);
  assert.doesNotMatch(sql, /grant (?:all|update|delete)[^;]*public\.audit_events[^;]*to service_role/i);
  for (const functionName of [
    "transition_profile_role",
    "transition_representative_authority",
    "record_coverage_determination",
    "transition_authorization_status",
    "transition_privacy_request_status",
  ]) {
    const fn = sql.match(new RegExp(`create or replace function public\\.${functionName}\\s*\\([\\s\\S]*?\\$function\\$;`, "i"));
    assert.ok(fn, `missing ${functionName}`);
    assert.match(fn[0], /p_actor_identity text/i);
    assert.match(fn[0], /actor_identity[^;]+p_actor_identity/is);
  }
});

test("coverage state and estimates have domain validation", async () => {
  const sql = await readFile(migrationPath, "utf8");
  assert.match(sql, /coverage_status text[^,]+check \(coverage_status in \('pending','active','inactive','unable_to_verify'\)\)/i);
  assert.match(sql, /benefit_status text[^,]+check \(benefit_status in \('pending','found','not_found','unable_to_verify'\)\)/i);
  assert.match(sql, /network_status text[^,]+check \(network_status in \('unknown','in_network','out_of_network','unable_to_verify'\)\)/i);
  assert.match(sql, /check \(estimate_cents is null or estimate_cents >= 0\)/i);
  assert.match(sql, /check \(estimated_responsibility_cents is null or estimated_responsibility_cents >= 0\)/i);
  assert.match(sql, /p_coverage_status not in \('pending','active','inactive','unable_to_verify'\)/i);
  assert.match(sql, /p_estimate_cents is not null and p_estimate_cents < 0/i);
});

test("checked-in SQL integration test covers representative revocation and isolation", async () => {
  const sql = await readFile(rlsIntegrationPath, "utf8");
  assert.match(sql, /select plan\(26\)/i);
  for (const table of ["bookings", "documentation", "consents", "privacy_requests"]) {
    assert.match(sql, new RegExp(`from public\\.${table}`, "i"));
  }
  assert.match(sql, /transition_representative_authority[^;]+?'revoke'/is);
  for (const scenario of ["verified representative", "revoked representative", "wrong-purpose representative", "unrelated user"]) {
    assert.match(sql, new RegExp(`'${scenario}[^']+'`, "i"));
  }
  for (const scenario of [
    "cross-household incident booking link denied on insert",
    "cross-household complaint booking link denied on insert",
    "cross-household booking provider cannot read incident",
    "cross-household booking provider cannot read complaint",
  ]) {
    assert.match(sql, new RegExp(`'${scenario}'`, "i"));
  }
  assert.match(sql, /set local role authenticated/i);
  assert.match(sql, /select \* from finish\(\)/i);
  assert.match(sql, /rollback/i);
});

test("Supabase README documents the focused SQL integration command", async () => {
  const readme = await readFile(supabaseReadmePath, "utf8");
  assert.match(readme, /supabase start/i);
  assert.match(readme, /supabase test db supabase\/tests\/rls_authorization\.sql/i);
});
