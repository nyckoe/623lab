import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { JSDOM } from "jsdom";

const path = new URL("../web/ckare-care.html", import.meta.url);

async function openDemo() {
  const html = await readFile(path, "utf8");
  return new JSDOM(html, {
    runScripts: "dangerously",
    pretendToBeVisual: true,
    beforeParse(window) {
      window.scrollTo = () => {};
      window.HTMLDialogElement.prototype.showModal = function showModal() { this.open = true; };
      window.HTMLDialogElement.prototype.close = function close() { this.open = false; };
    },
  });
}

test("CKare Care atomically replaces household records when context changes", async () => {
  const dom = await openDemo();
  const { document, Event } = dom.window;
  const person = document.querySelector("#person");

  assert.match(document.querySelector("#content").textContent, /Maya Chen/);
  person.value = "arthur";
  person.dispatchEvent(new Event("change", { bubbles: true }));

  const content = document.querySelector("#content").textContent;
  assert.match(content, /Arthur Chen/);
  assert.match(content, /Harborwell Health/);
  assert.doesNotMatch(content, /Maya Chen/);
  assert.doesNotMatch(content, /Evergreen Health/);
});

test("CKare Care keeps the household selector focused and isolates records in both directions", async () => {
  const dom = await openDemo();
  const { document, Event } = dom.window;
  const person = document.querySelector("#person");

  person.focus();
  person.value = "arthur";
  person.dispatchEvent(new Event("change", { bubbles: true }));
  assert.equal(document.activeElement, person);
  assert.doesNotMatch(document.querySelector("#content").textContent, /Maya Chen/);

  person.value = "maya";
  person.dispatchEvent(new Event("change", { bubbles: true }));
  assert.equal(document.activeElement, person);
  assert.match(document.querySelector("#content").textContent, /Maya Chen/);
  assert.doesNotMatch(document.querySelector("#content").textContent, /Arthur Chen/);
});

test("CKare Care provider dialog content follows the selected household", async () => {
  const dom = await openDemo();
  const { document, Event } = dom.window;
  const person = document.querySelector("#person");
  const dialog = document.querySelector("#provider-dialog");

  person.value = "arthur";
  person.dispatchEvent(new Event("change", { bubbles: true }));
  assert.match(dialog.textContent, /Morgan Torres, RN/);
  assert.doesNotMatch(dialog.textContent, /Elena Rivera, LMSW/);

  person.value = "maya";
  person.dispatchEvent(new Event("change", { bubbles: true }));
  assert.match(dialog.textContent, /Elena Rivera, LMSW/);
  assert.doesNotMatch(dialog.textContent, /Morgan Torres, RN/);
});

test("CKare Care dialogs move focus, announce state, and restore the invoking control", async () => {
  const dom = await openDemo();
  const { document, Event } = dom.window;
  const opener = document.querySelector('[data-dialog="provider-dialog"]');
  const dialog = document.querySelector("#provider-dialog");

  opener.focus();
  opener.dispatchEvent(new Event("click", { bubbles: true }));
  assert.equal(dialog.open, true);
  assert.equal(document.activeElement, dialog.querySelector("[data-dialog-focus]"));
  assert.match(document.querySelector("#live-status").textContent, /opened/i);
  assert.match(dialog.querySelector("[aria-live]").textContent, /opened/i);

  dialog.querySelector("[data-close]").dispatchEvent(new Event("click", { bubbles: true }));
  assert.equal(dialog.open, false);
  assert.equal(document.activeElement, opener);
  assert.match(document.querySelector("#live-status").textContent, /closed/i);
});

test("CKare Care navigation focuses its heading and announces the destination", async () => {
  const dom = await openDemo();
  const { document, Event } = dom.window;
  document.querySelector('[data-view="coverage"]').dispatchEvent(new Event("click", { bubbles: true }));

  const heading = document.querySelector("#view-coverage h1");
  assert.equal(document.activeElement, heading);
  assert.equal(heading.getAttribute("tabindex"), "-1");
  assert.match(document.querySelector("#live-status").textContent, /coverage/i);
});

test("CKare Care announces Home and Profile labels as navigation destinations", async () => {
  const dom = await openDemo();
  const { document, Event } = dom.window;

  document.querySelector('[data-view="profile"]').dispatchEvent(new Event("click", { bubbles: true }));
  assert.match(document.querySelector("#live-status").textContent, /^Profile view loaded\./);

  document.querySelector('[data-view="home"]').dispatchEvent(new Event("click", { bubbles: true }));
  assert.match(document.querySelector("#live-status").textContent, /^Home view loaded\./);
});

test("CKare Care keeps secondary dialog buttons legible on raised surfaces", async () => {
  const html = await readFile(path, "utf8");
  assert.match(html, /\.button\.secondary\{background:var\(--raised\);border-color:var\(--ink\);color:var\(--ink\)/);
});
