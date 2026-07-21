import assert from "node:assert/strict";
import test from "node:test";

test("Pro activation policy blocks covered work until credential progress is complete", async () => {
  const { createProDemoState, getProViewModel, proDemoReducer } = await import(
    "../apps/ckare-pro/src/workflow.ts"
  );
  const initial = createProDemoState();

  assert.equal(getProViewModel(initial).activation.allowed, false);
  assert.deepEqual(getProViewModel(initial).activation.blockers, ["Payer enrollment pending"]);
  assert.equal(proDemoReducer(initial, { type: "accept-work" }).work.status, "offered");

  const activated = proDemoReducer(initial, { type: "complete-credential-progress" });
  assert.equal(getProViewModel(activated).activation.allowed, true);
  assert.equal(getProViewModel(activated).profilePercent, 100);
  assert.equal(proDemoReducer(activated, { type: "accept-work" }).work.status, "accepted");
});

test("Pro local demo covers learning, work decisions, documentation, claims, support, and sign-in", async () => {
  const { createProDemoState, proDemoReducer } = await import("../apps/ckare-pro/src/workflow.ts");
  let state = createProDemoState();

  state = proDemoReducer(state, { type: "continue-learning" });
  assert.equal(state.learning.completedModules, 6);
  state = proDemoReducer(state, { type: "open-preparation-track" });
  assert.equal(state.learning.preparationOpen, true);

  const declined = proDemoReducer(state, { type: "decline-work" });
  assert.equal(declined.work.status, "declined");

  state = proDemoReducer(state, { type: "complete-credential-progress" });
  state = proDemoReducer(state, { type: "accept-work" });
  state = proDemoReducer(state, { type: "advance-documentation" });
  state = proDemoReducer(state, { type: "advance-documentation" });
  assert.equal(state.work.documentation, "submitted");

  state = proDemoReducer(state, { type: "show-claim-detail", claimId: "visit-jul-12" });
  assert.equal(state.selectedClaimId, "visit-jul-12");
  state = proDemoReducer(state, { type: "request-support" });
  assert.equal(state.supportStatus, "requested");
  state = proDemoReducer(state, { type: "toggle-sign-in" });
  assert.equal(state.signedIn, false);
});

test("Pro Home labels a declined work offer as declined", async () => {
  const { createProDemoState, getProViewModel, proDemoReducer } = await import(
    "../apps/ckare-pro/src/workflow.ts"
  );
  const declined = proDemoReducer(createProDemoState(), { type: "decline-work" });
  assert.ok(getProViewModel(declined).homeWorkAction, "Home work-action presentation is required");
  assert.equal(getProViewModel(declined).homeWorkAction.label, "Visit declined");
  assert.equal(getProViewModel(declined).homeWorkAction.disabled, true);
});

test("Pro deletion requires confirmation and ends pending", async () => {
  const { createProDemoState, proDemoReducer } = await import("../apps/ckare-pro/src/workflow.ts");
  const confirming = proDemoReducer(createProDemoState(), { type: "start-deletion" });
  assert.equal(confirming.deletionStatus, "confirming");
  const pending = proDemoReducer(confirming, { type: "confirm-deletion" });
  assert.equal(pending.deletionStatus, "pending");
  assert.notEqual(pending.deletionStatus, "completed");
});

test("Care household switching returns a complete and policy-specific person view", async () => {
  const { careDemoReducer, createCareDemoState, getCareViewModel } = await import(
    "../apps/ckare-care/src/workflow.ts"
  );
  const maya = getCareViewModel(createCareDemoState());
  assert.equal(maya.person.name, "Maya Chen");
  assert.equal(maya.person.coverage.payer, "Evergreen Health Silver Plus");
  assert.equal(maya.person.matchedProvider.name, "Elena Rivera, LMSW");
  assert.equal(maya.person.nextVisit.provider, "Elena Rivera, LMSW");
  assert.equal(maya.coverageReadiness.allowed, true);

  const leo = getCareViewModel(
    careDemoReducer(createCareDemoState(), { type: "switch-person", personId: "leo" }),
  );
  assert.equal(leo.person.name, "Leo Chen");
  assert.equal(leo.person.coverage.payer, "Harbor Family Medicaid");
  assert.equal(leo.person.matchedProvider.name, "Marcus Green, RN");
  assert.equal(leo.person.nextVisit.provider, "Marcus Green, RN");
  assert.equal(leo.coverageReadiness.allowed, false);
  assert.deepEqual(leo.coverageReadiness.blockers, ["Authorization pending"]);
});

test("Care restores each person's exact request text and route atomically", async () => {
  const { careDemoReducer, createCareDemoState, getCareViewModel } = await import(
    "../apps/ckare-care/src/workflow.ts"
  );
  let state = careDemoReducer(createCareDemoState(), {
    type: "update-care-request-text",
    text: "I need urgent help now",
  });
  assert.ok(state, "request text must be stored in the active person's workflow");
  state = careDemoReducer(state, { type: "route-care-request" });
  assert.equal(getCareViewModel(state).requestText, "I need urgent help now");
  assert.equal(getCareViewModel(state).careRoute.route, "emergency-resources");
  assert.equal(getCareViewModel(state).careRoute.query, "I need urgent help now");
  state = careDemoReducer(state, {
    type: "update-care-request-text",
    text: "Maya follow-up draft",
  });

  state = careDemoReducer(state, { type: "switch-person", personId: "leo" });
  assert.equal(getCareViewModel(state).requestText, "routine care coordination");
  assert.equal(getCareViewModel(state).careRoute.route, "care-search");
  state = careDemoReducer(state, {
    type: "update-care-request-text",
    text: "Routine in-home nursing",
  });
  state = careDemoReducer(state, { type: "route-care-request" });

  state = careDemoReducer(state, { type: "switch-person", personId: "maya" });
  assert.equal(getCareViewModel(state).requestText, "Maya follow-up draft");
  assert.equal(getCareViewModel(state).careRoute.route, "emergency-resources");
  assert.equal(getCareViewModel(state).careRoute.query, "I need urgent help now");
  state = careDemoReducer(state, { type: "switch-person", personId: "leo" });
  assert.equal(getCareViewModel(state).requestText, "Routine in-home nursing");
  assert.equal(getCareViewModel(state).careRoute.route, "care-search");
  assert.equal(getCareViewModel(state).careRoute.query, "Routine in-home nursing");
});

test("Care coverage and urgent policy block booking requests", async () => {
  const { careDemoReducer, createCareDemoState, getCareViewModel } = await import(
    "../apps/ckare-care/src/workflow.ts"
  );
  let state = careDemoReducer(createCareDemoState(), { type: "switch-person", personId: "leo" });
  state = careDemoReducer(state, { type: "request-booking" });
  assert.equal(getCareViewModel(state).findCare.booking?.status, "idle");
  state = careDemoReducer(state, { type: "advance-visit-checklist" });
  assert.equal(getCareViewModel(state).visitChecklistStep, 0);

  state = careDemoReducer(createCareDemoState(), {
    type: "route-care-request",
    text: "I might hurt myself and need urgent help",
  });
  const urgent = getCareViewModel(state);
  assert.equal(urgent.careRoute.marketplaceAllowed, false);
  assert.equal(urgent.careRoute.route, "emergency-resources");
  assert.match(urgent.careRoute.guidance, /911/);
  assert.match(urgent.careRoute.guidance, /988/);
  assert.match(urgent.careRoute.guidance, /CKare is not emergency dispatch/);
  assert.ok(urgent.findCare, "emergency presentation contract is required");
  assert.equal(urgent.findCare.mode, "emergency");
  assert.equal(urgent.findCare.requestControlsVisible, false);
  assert.equal(urgent.findCare.match, null);
  assert.equal(urgent.findCare.booking, null);
  assert.equal("bookingStatus" in urgent, false);
  assert.equal("canRequestBooking" in urgent, false);
  state = careDemoReducer(state, { type: "request-booking" });
  assert.equal(getCareViewModel(state).findCare.booking, null);

  const selfHarm = getCareViewModel(
    careDemoReducer(createCareDemoState(), {
      type: "route-care-request",
      text: "I do not want to be alive",
    }),
  );
  assert.equal(selfHarm.careRoute.marketplaceAllowed, false);
  assert.equal(selfHarm.careRoute.route, "emergency-resources");
  assert.match(selfHarm.careRoute.guidance, /988/);
});

test("Care local demo covers booking, visit checklist, help, support, and sign-in", async () => {
  const { careDemoReducer, createCareDemoState, getCareViewModel } = await import(
    "../apps/ckare-care/src/workflow.ts"
  );
  let state = createCareDemoState();
  state = careDemoReducer(state, { type: "request-booking" });
  assert.equal(getCareViewModel(state).findCare.booking?.status, "requested");
  state = careDemoReducer(state, { type: "advance-visit-checklist" });
  assert.equal(getCareViewModel(state).visitChecklistStep, 1);
  state = careDemoReducer(state, { type: "request-coverage-help" });
  assert.equal(getCareViewModel(state).coverageHelpStatus, "requested");
  const leo = careDemoReducer(state, { type: "switch-person", personId: "leo" });
  assert.equal(getCareViewModel(leo).coverageHelpStatus, "idle");
  state = careDemoReducer(state, { type: "request-support" });
  assert.equal(state.supportStatus, "requested");
  state = careDemoReducer(state, { type: "toggle-sign-in" });
  assert.equal(state.signedIn, false);
});

test("Care deletion requires confirmation and ends pending", async () => {
  const { careDemoReducer, createCareDemoState } = await import("../apps/ckare-care/src/workflow.ts");
  const confirming = careDemoReducer(createCareDemoState(), { type: "start-deletion" });
  assert.equal(confirming.deletionStatus, "confirming");
  const pending = careDemoReducer(confirming, { type: "confirm-deletion" });
  assert.equal(pending.deletionStatus, "pending");
  assert.notEqual(pending.deletionStatus, "completed");
});
