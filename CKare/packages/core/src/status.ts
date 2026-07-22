import type { CoverageState, PolicyResult, ProviderActivationState } from "./types.ts";

export function getProviderActivation(state: ProviderActivationState): PolicyResult {
  const blockers: string[] = [];
  if (!state.identityVerified) blockers.push("Identity verification required");
  if (!state.qualificationComplete) blockers.push("Qualification incomplete");
  if (state.credentialStatus === "expired") blockers.push("Credential expired");
  if (state.credentialStatus === "suspended") blockers.push("Credential suspended");
  if (state.credentialStatus === "under_review") blockers.push("Credential under review");
  if (state.credentialStatus === "unverified") blockers.push("Credential verification required");
  if (!state.checksCleared) blockers.push("Background or exclusion check pending");
  if (!state.payerReady) blockers.push("Payer enrollment pending");
  if (!state.serviceInScope) blockers.push("Service is outside verified scope");
  return {
    allowed: blockers.length === 0,
    label: blockers.length === 0 ? "Marketplace active" : "Action required",
    blockers,
  };
}

export function getCoverageReadiness(state: CoverageState): PolicyResult {
  const blockers: string[] = [];
  if (!state.identityVerified) blockers.push("Identity verification required");
  if (!state.coverageActive) blockers.push("Coverage is not active");
  if (!state.benefitFound) blockers.push("Benefit not confirmed");
  if (!state.providerInNetwork) blockers.push("Provider network status not confirmed");
  if (state.authorization === "pending") blockers.push("Authorization pending");
  if (state.authorization === "denied") blockers.push("Authorization denied");
  if (state.authorization === "expired") blockers.push("Authorization expired");
  if (!state.estimateAvailable) blockers.push("Cost estimate unavailable");
  return {
    allowed: blockers.length === 0,
    label: blockers.length === 0 ? "Ready to book under insurance" : "Coverage steps remaining",
    blockers,
  };
}

export function routeCareIntent(intent: "routine" | "urgent" | "emergency") {
  if (intent === "emergency") {
    return { route: "emergency-resources", marketplaceAllowed: false } as const;
  }
  return { route: intent === "urgent" ? "same-day-options" : "care-search", marketplaceAllowed: true } as const;
}
