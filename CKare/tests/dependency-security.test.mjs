import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("web workspace pins the patched Sharp runtime", async () => {
  const pkg = JSON.parse(await readFile(new URL("package.json", root), "utf8"));
  assert.equal(pkg.overrides?.sharp, "0.35.3");

  const installed = JSON.parse(
    await readFile(new URL("node_modules/sharp/package.json", root), "utf8"),
  );
  assert.equal(installed.version, "0.35.3");
});
