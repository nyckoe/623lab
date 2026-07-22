export type CredentialStatus = "unverified" | "valid" | "expired" | "suspended" | "under_review";
export type AuthorizationStatus = "not_required" | "pending" | "approved" | "denied" | "expired";

export interface ProviderActivationState {
  identityVerified: boolean;
  qualificationComplete: boolean;
  credentialStatus: CredentialStatus;
  checksCleared: boolean;
  payerReady: boolean;
  serviceInScope: boolean;
}

export interface CoverageState {
  identityVerified: boolean;
  coverageActive: boolean;
  benefitFound: boolean;
  providerInNetwork: boolean;
  authorization: AuthorizationStatus;
  estimateAvailable: boolean;
}

export interface PolicyResult {
  allowed: boolean;
  label: string;
  blockers: string[];
}

export interface ProviderSummary {
  id: string;
  name: string;
  credential: string;
  service: string;
  languages: string[];
  distanceMiles: number;
  nextAvailable: string;
}
