import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../store-assets/", import.meta.url);
const apps = ["ckare-pro", "ckare-care"];

test("both apps include Apple, Google, privacy, and review packages", async () => {
  for (const app of apps) {
    const files = await Promise.all(["apple-listing.md", "google-play-listing.md", "privacy-worksheet.md", "review-notes.md"].map((name) => readFile(new URL(`${app}/${name}`, root), "utf8")));
    const combined = files.join("\n");
    assert.match(combined, /not emergency dispatch/i);
    assert.match(combined, /does not guarantee payment/i);
    assert.match(combined, /delete account/i);
    assert.match(combined, /reviewer/i);
  }
});

test("store titles and Google short descriptions fit console limits", async () => {
  for (const app of apps) {
    const apple = await readFile(new URL(`${app}/apple-listing.md`, root), "utf8");
    const google = await readFile(new URL(`${app}/google-play-listing.md`, root), "utf8");
    const title = apple.match(/^Name: (.+)$/m)?.[1] ?? "";
    const short = google.match(/^Short description: (.+)$/m)?.[1] ?? "";
    assert.ok(title.length > 0 && title.length <= 30, `${app} Apple name length`);
    assert.ok(short.length > 0 && short.length <= 80, `${app} Google short description length`);
  }
});

test("shared policy drafts include privacy rights and marketplace boundaries", async () => {
  const files = await Promise.all(["privacy-policy.md", "terms-of-use.md", "support-and-deletion.md"].map((name) => readFile(new URL(`shared/${name}`, root), "utf8")));
  const combined = files.join("\n");
  for (const phrase of ["data export", "account deletion", "not a license", "not emergency dispatch", "does not guarantee payment"]) {
    assert.match(combined, new RegExp(phrase, "i"), `missing ${phrase}`);
  }
});

test("store plans describe generated fictional phone frames without claiming push is live", async () => {
  for (const app of apps) {
    const checklist = await readFile(new URL(`${app}/submission-checklist.md`, root), "utf8");
    assert.match(checklist, /1320 × 2868/i, `${app} Apple phone frame`);
    assert.match(checklist, /1080 × 1920/i, `${app} Android phone frame`);
    assert.match(checklist, /tablet.*not enabled/i, `${app} excludes unsupported tablets`);
    assert.match(checklist, /notification.*owner-controlled/i, `${app} notification boundary`);
    assert.doesNotMatch(checklist, /push notifications are live/i, `${app} does not claim live push`);
  }
});
