import assert from "node:assert/strict";
import test from "node:test";

test("Quiet Confidence tokens expose the approved accessible foundation", async () => {
  const { colors, sizing } = await import("../packages/design/src/tokens.ts");

  assert.equal(colors.paper, "#F7F3EA");
  assert.equal(colors.ink, "#17342F");
  assert.equal(colors.coral, "#E86F51");
  assert.equal(colors.mint, "#D8E9DF");
  assert.equal(sizing.minimumTouchTarget, 44);
});

test("provider activation reports every unmet regulated prerequisite", async () => {
  const { getProviderActivation } = await import("../packages/core/src/status.ts");
  const result = getProviderActivation({
    identityVerified: true,
    qualificationComplete: true,
    credentialStatus: "expired",
    checksCleared: true,
    payerReady: true,
    serviceInScope: true,
  });

  assert.equal(result.allowed, false);
  assert.equal(result.label, "Action required");
  assert.deepEqual(result.blockers, ["Credential expired"]);
});

test("coverage readiness keeps authorization separate from active coverage", async () => {
  const { getCoverageReadiness } = await import("../packages/core/src/status.ts");
  const pending = getCoverageReadiness({
    identityVerified: true,
    coverageActive: true,
    benefitFound: true,
    providerInNetwork: true,
    authorization: "pending",
    estimateAvailable: true,
  });
  const approved = getCoverageReadiness({
    identityVerified: true,
    coverageActive: true,
    benefitFound: true,
    providerInNetwork: true,
    authorization: "approved",
    estimateAvailable: true,
  });

  assert.equal(pending.allowed, false);
  assert.match(pending.blockers.join(" "), /Authorization pending/);
  assert.equal(approved.allowed, true);
  assert.equal(approved.label, "Ready to book under insurance");
});

test("urgent intent exits marketplace matching", async () => {
  const { routeCareIntent } = await import("../packages/core/src/status.ts");

  assert.deepEqual(routeCareIntent("emergency"), {
    route: "emergency-resources",
    marketplaceAllowed: false,
  });
  assert.equal(routeCareIntent("routine").marketplaceAllowed, true);
});
