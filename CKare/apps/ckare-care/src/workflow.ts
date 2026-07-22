import { getCoverageReadiness, routeCareIntent, type CoverageState } from "@ckare/core";

export type HouseholdPersonId = "maya" | "leo";
export type CareDeletionStatus = "idle" | "confirming" | "pending";

export interface HouseholdPerson {
  id: HouseholdPersonId;
  name: string;
  context: string;
  representative: string;
  relationship: string;
  coverageState: CoverageState;
  coverage: {
    payer: string;
    checked: string;
    responsibility: string;
    authorizationLabel: string;
  };
  matchedProvider: {
    name: string;
    credential: string;
    fit: string;
    next: string;
    distance: string;
  };
  nextVisit: {
    provider: string;
    service: string;
    time: string;
    format: string;
    responsibility: string;
  };
  preferences: { language: string; accessibility: string; reminders: string };
}

export interface CareRoute {
  route: "care-search" | "emergency-resources";
  marketplaceAllowed: boolean;
  guidance: string;
  query: string;
}

interface PersonWorkflow {
  requestText: string;
  careRoute: CareRoute;
  bookingStatus: "idle" | "requested";
  visitChecklistStep: number;
  coverageHelpStatus: "idle" | "requested";
}

export interface CareDemoState {
  activePersonId: HouseholdPersonId;
  personWorkflows: Record<HouseholdPersonId, PersonWorkflow>;
  supportStatus: "idle" | "requested";
  signedIn: boolean;
  deletionStatus: CareDeletionStatus;
}

export type CareDemoAction =
  | { type: "switch-person"; personId: HouseholdPersonId }
  | { type: "update-care-request-text"; text: string }
  | { type: "route-care-request"; text?: string }
  | { type: "request-booking" }
  | { type: "advance-visit-checklist" }
  | { type: "request-coverage-help" }
  | { type: "request-support" }
  | { type: "toggle-sign-in" }
  | { type: "start-deletion" }
  | { type: "cancel-deletion" }
  | { type: "confirm-deletion" };

export const householdPeople: Record<HouseholdPersonId, HouseholdPerson> = {
  maya: {
    id: "maya",
    name: "Maya Chen",
    context: "My care",
    representative: "Self",
    relationship: "Self",
    coverageState: {
      identityVerified: true,
      coverageActive: true,
      benefitFound: true,
      providerInNetwork: true,
      authorization: "approved",
      estimateAvailable: true,
    },
    coverage: {
      payer: "Evergreen Health Silver Plus",
      checked: "Checked today · 9:42 AM",
      responsibility: "$24–$38",
      authorizationLabel: "Authorization approved",
    },
    matchedProvider: {
      name: "Elena Rivera, LMSW",
      credential: "Provider credentials verified",
      fit: "Care coordination · English & Spanish",
      next: "Today · 3:30 PM",
      distance: "1.8 miles",
    },
    nextVisit: {
      provider: "Elena Rivera, LMSW",
      service: "Care coordination",
      time: "Thursday · 10:00 AM",
      format: "Video visit",
      responsibility: "$24–$38 estimated",
    },
    preferences: { language: "English", accessibility: "Large text", reminders: "Text and email" },
  },
  leo: {
    id: "leo",
    name: "Leo Chen",
    context: "Family care",
    representative: "Maya Chen",
    relationship: "Authorized family member",
    coverageState: {
      identityVerified: true,
      coverageActive: true,
      benefitFound: true,
      providerInNetwork: true,
      authorization: "pending",
      estimateAvailable: true,
    },
    coverage: {
      payer: "Harbor Family Medicaid",
      checked: "Checked today · 9:46 AM",
      responsibility: "$0–$15",
      authorizationLabel: "Authorization pending",
    },
    matchedProvider: {
      name: "Marcus Green, RN",
      credential: "Provider credentials verified",
      fit: "In-home nursing · English",
      next: "Friday · 1:00 PM",
      distance: "3.2 miles",
    },
    nextVisit: {
      provider: "Marcus Green, RN",
      service: "In-home nursing assessment",
      time: "Friday · 1:00 PM",
      format: "Home visit",
      responsibility: "$0–$15 estimated",
    },
    preferences: { language: "English", accessibility: "Reduced motion", reminders: "Email" },
  },
};

export function routeCareRequest(text: string): CareRoute {
  const safetyLanguage = /\b(urgent|emergency|suicid(?:e|al)|self[- ]?harm|hurt myself|kill myself|end my life|do not want to be alive|don't want to be alive|overdose|not safe)\b/i;
  const isSafetyRoute = safetyLanguage.test(text);
  const policyRoute = routeCareIntent(isSafetyRoute ? "emergency" : "routine");
  if (policyRoute.route === "same-day-options") {
    throw new Error("Native care requests must normalize urgent language to emergency resources");
  }
  return {
    route: policyRoute.route,
    marketplaceAllowed: policyRoute.marketplaceAllowed,
    guidance: isSafetyRoute
      ? "Call 911 for immediate danger. Call or text 988 for suicide or crisis support. CKare is not emergency dispatch."
      : "Routine care matching is available for this fictional local demo.",
    query: text,
  };
}

export function createCareDemoState(): CareDemoState {
  const requestText = "routine care coordination";
  return {
    activePersonId: "maya",
    personWorkflows: {
      maya: { requestText, careRoute: routeCareRequest(requestText), bookingStatus: "idle", visitChecklistStep: 0, coverageHelpStatus: "idle" },
      leo: { requestText, careRoute: routeCareRequest(requestText), bookingStatus: "idle", visitChecklistStep: 0, coverageHelpStatus: "idle" },
    },
    supportStatus: "idle",
    signedIn: true,
    deletionStatus: "idle",
  };
}

export function getCareViewModel(state: CareDemoState) {
  const person = householdPeople[state.activePersonId];
  const coverageReadiness = getCoverageReadiness(person.coverageState);
  const workflow = state.personWorkflows[state.activePersonId];
  const canRequestBooking = coverageReadiness.allowed && workflow.careRoute.marketplaceAllowed;
  const findCare = workflow.careRoute.marketplaceAllowed
    ? {
        mode: "marketplace" as const,
        guidance: workflow.careRoute.guidance,
        requestControlsVisible: true as const,
        match: person.matchedProvider,
        booking: { status: workflow.bookingStatus, enabled: canRequestBooking && workflow.bookingStatus === "idle" },
      }
    : {
        mode: "emergency" as const,
        guidance: workflow.careRoute.guidance,
        requestControlsVisible: false as const,
        match: null,
        booking: null,
      };
  return {
    person,
    coverageReadiness,
    requestText: workflow.requestText,
    careRoute: workflow.careRoute,
    visitChecklistStep: workflow.visitChecklistStep,
    coverageHelpStatus: workflow.coverageHelpStatus,
    findCare,
  };
}

export function careDemoReducer(state: CareDemoState, action: CareDemoAction): CareDemoState {
  switch (action.type) {
    case "switch-person":
      return { ...state, activePersonId: action.personId };
    case "update-care-request-text":
      return updatePersonWorkflow(state, { requestText: action.text });
    case "route-care-request": {
      const requestText = action.text ?? state.personWorkflows[state.activePersonId].requestText;
      return updatePersonWorkflow(state, { requestText, careRoute: routeCareRequest(requestText) });
    }
    case "request-booking": {
      const findCare = getCareViewModel(state).findCare;
      if (findCare.mode === "emergency" || !findCare.booking.enabled) return state;
      return updatePersonWorkflow(state, { bookingStatus: "requested" });
    }
    case "advance-visit-checklist":
      if (!getCareViewModel(state).coverageReadiness.allowed) return state;
      return updatePersonWorkflow(state, {
        visitChecklistStep: Math.min(3, state.personWorkflows[state.activePersonId].visitChecklistStep + 1),
      });
    case "request-coverage-help":
      return updatePersonWorkflow(state, { coverageHelpStatus: "requested" });
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

function updatePersonWorkflow(state: CareDemoState, update: Partial<PersonWorkflow>): CareDemoState {
  return {
    ...state,
    personWorkflows: {
      ...state.personWorkflows,
      [state.activePersonId]: { ...state.personWorkflows[state.activePersonId], ...update },
    },
  };
}
