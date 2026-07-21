import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("release handoff documents exact build and submission commands", async () => {
  const readme = await readFile(new URL("STORE_SUBMISSION_README.md", root), "utf8");
  for (const command of [
    "npm test",
    "npm run typecheck:pro",
    "npm run typecheck:care",
    "npm run doctor:pro",
    "npm run doctor:care",
    "eas build --platform ios",
    "eas build --platform android",
    "node scripts/generate-store-assets.mjs",
  ]) assert.match(readme, new RegExp(command.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("release handoff avoids the cwd-breaking Expo Doctor invocation", async () => {
  const readme = await readFile(new URL("STORE_SUBMISSION_README.md", root), "utf8");
  assert.doesNotMatch(readme, /npm --prefix apps\/ckare-(?:pro|care) exec expo-doctor/);
});

test("release handoff makes notification credentials owner-only and documents the phone-only screenshot plan", async () => {
  const readme = await readFile(new URL("STORE_SUBMISSION_README.md", root), "utf8");
  assert.match(readme, /notification.*credentials.*owner/i);
  assert.match(readme, /1320 × 2868/);
  assert.match(readme, /1080 × 1920/);
  assert.match(readme, /tablet.*not enabled/i);
});

test("each app has a submission checklist and owner inputs are explicit", async () => {
  const files = await Promise.all([
    "store-assets/ckare-pro/submission-checklist.md",
    "store-assets/ckare-care/submission-checklist.md",
    "store-assets/OWNER_INPUTS.md",
  ].map((relative) => readFile(new URL(relative, root), "utf8")));
  const combined = files.join("\n");
  for (const phrase of ["Apple Developer", "Google Play Console", "bundle identifier", "privacy policy URL", "reviewer account", "signing"]) assert.match(combined, new RegExp(phrase, "i"));
});
