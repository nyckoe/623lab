import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { JSDOM } from "jsdom";

const path = new URL("../web/ckare-pro.html", import.meta.url);

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

test("CKare Pro navigation focuses its heading and announces the destination", async () => {
  const dom = await openDemo();
  const { document, Event } = dom.window;
  document.querySelector('[data-view="learn"]').dispatchEvent(new Event("click", { bubbles: true }));

  const heading = document.querySelector("#view-learn h1");
  assert.equal(document.activeElement, heading);
  assert.equal(heading.getAttribute("tabindex"), "-1");
  assert.match(document.querySelector("#live-status").textContent, /learn/i);
});

test("CKare Pro dialogs move focus, announce state, and restore the invoking control", async () => {
  const dom = await openDemo();
  const { document, Event } = dom.window;
  const opener = document.querySelector('[data-dialog="activation-dialog"]');
  const dialog = document.querySelector("#activation-dialog");

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

test("CKare Pro keeps secondary dialog buttons legible on raised surfaces", async () => {
  const html = await readFile(path, "utf8");
  assert.match(html, /\.button\.secondary\{background:var\(--raised\);border-color:var\(--ink\);color:var\(--ink\)/);
});
