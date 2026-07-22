import { getProviderActivation, type ProviderActivationState } from "@ckare/core";

export type ProDeletionStatus = "idle" | "confirming" | "pending";
export type ProWorkStatus = "offered" | "accepted" | "declined";
export type DocumentationStatus = "not_started" | "in_progress" | "submitted";

export interface ProDemoState {
  signedIn: boolean;
  learning: { completedModules: number; totalModules: number; preparationOpen: boolean };
  activationState: ProviderActivationState;
  work: { status: ProWorkStatus; documentation: DocumentationStatus };
  selectedClaimId: string | null;
  supportStatus: "idle" | "requested";
  deletionStatus: ProDeletionStatus;
}

export type ProDemoAction =
  | { type: "continue-learning" }
  | { type: "open-preparation-track" }
  | { type: "complete-credential-progress" }
  | { type: "accept-work" }
  | { type: "decline-work" }
  | { type: "advance-documentation" }
  | { type: "show-claim-detail"; claimId: string }
  | { type: "request-support" }
  | { type: "toggle-sign-in" }
  | { type: "start-deletion" }
  | { type: "cancel-deletion" }
  | { type: "confirm-deletion" };

export function createProDemoState(): ProDemoState {
  return {
    signedIn: true,
    learning: { completedModules: 5, totalModules: 9, preparationOpen: false },
    activationState: {
      identityVerified: true,
      qualificationComplete: true,
      credentialStatus: "valid",
      checksCleared: true,
      payerReady: false,
      serviceInScope: true,
    },
    work: { status: "offered", documentation: "not_started" },
    selectedClaimId: null,
    supportStatus: "idle",
    deletionStatus: "idle",
  };
}

export function getProViewModel(state: ProDemoState) {
  const activation = getProviderActivation(state.activationState);
  const canAcceptWork = activation.allowed && state.work.status === "offered";
  const homeWorkAction = state.work.status === "accepted"
    ? { label: "Visit accepted", disabled: true }
    : state.work.status === "declined"
      ? { label: "Visit declined", disabled: true }
      : { label: "Accept eligible visit", disabled: !canAcceptWork };
  return {
    activation,
    profilePercent: state.activationState.payerReady ? 100 : 92,
    canAcceptWork,
    canDocumentVisit: activation.allowed && state.work.status === "accepted",
    homeWorkAction,
  };
}

export function proDemoReducer(state: ProDemoState, action: ProDemoAction): ProDemoState {
  switch (action.type) {
    case "continue-learning":
      return {
        ...state,
        learning: {
          ...state.learning,
          completedModules: Math.min(state.learning.totalModules, state.learning.completedModules + 1),
        },
      };
    case "open-preparation-track":
      return { ...state, learning: { ...state.learning, preparationOpen: true } };
    case "complete-credential-progress":
      return { ...state, activationState: { ...state.activationState, payerReady: true } };
    case "accept-work":
      return getProViewModel(state).canAcceptWork
        ? { ...state, work: { ...state.work, status: "accepted" } }
        : state;
    case "decline-work":
      return state.work.status === "offered"
        ? { ...state, work: { ...state.work, status: "declined" } }
        : state;
    case "advance-documentation":
      if (!getProViewModel(state).canDocumentVisit || state.work.documentation === "submitted") return state;
      return {
        ...state,
        work: {
          ...state.work,
          documentation: state.work.documentation === "not_started" ? "in_progress" : "submitted",
        },
      };
    case "show-claim-detail":
      return { ...state, selectedClaimId: action.claimId };
    case "request-support":
      return { ...state, supportStatus: "requested" };
    case "toggle-sign-in":
      return { ...state, signedIn: !state.signedIn };
    case "start-deletion":
      return state.deletionStatus === "idle" ? { ...state, deletionStatus: "confirming" } : state;
    case "cancel-deletion":
      return state.deletionStatus === "confirming" ? { ...state, deletionStatus: "idle" } : state;
    case "confirm-deletion":
      return state.deletionStatus === "confirming" ? { ...state, deletionStatus: "pending" } : state;
  }
}
