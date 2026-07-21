import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const appRoot = new URL("../apps/ckare-pro/", import.meta.url);

test("CKare Pro has independent store identity and five tab routes", async () => {
  const config = JSON.parse(await readFile(new URL("app.json", appRoot), "utf8"));
  assert.equal(config.expo.name, "CKare Pro");
  assert.equal(config.expo.slug, "ckare-pro");
  assert.equal(config.expo.scheme, "ckarepro");
  assert.equal(config.expo.ios.bundleIdentifier, "com.ckare.pro");
  assert.equal(config.expo.android.package, "com.ckare.pro");
  assert.equal(config.expo.icon, "./assets/icon.png");
  assert.equal(config.expo.android.adaptiveIcon.foregroundImage, "./assets/adaptive-icon.png");

  const routes = ["index.tsx", "learn.tsx", "work.tsx", "earnings.tsx", "profile.tsx"];
  await Promise.all(routes.map((route) => access(new URL(`app/(tabs)/${route}`, appRoot))));
});

test("CKare Pro exposes release build profiles", async () => {
  const eas = JSON.parse(await readFile(new URL("eas.json", appRoot), "utf8"));
  assert.equal(eas.build.production.autoIncrement, true);
  assert.deepEqual(eas.submit.production, {});
});

test("CKare Pro screens disclose regulated status and worker economics", async () => {
  const files = await Promise.all(
    ["index.tsx", "learn.tsx", "work.tsx", "earnings.tsx", "profile.tsx"].map((name) =>
      readFile(new URL(`app/(tabs)/${name}`, appRoot), "utf8"),
    ),
  );
  const source = `${files.join("\n")}\n${await readFile(new URL("src/data/demo.ts", appRoot), "utf8")}`;

  for (const phrase of [
    "Marketplace activation",
    "Course completion is not a license",
    "Authorization approved",
    "Emergency services",
    "Estimated payout—not guaranteed",
    "Delete account",
  ]) {
    assert.match(source, new RegExp(phrase, "i"), `missing ${phrase}`);
  }
});

test("CKare Pro wires required native actions, policy state, and safe areas", async () => {
  const primitives = await readFile(new URL("src/components/Primitives.tsx", appRoot), "utf8");
  const screen = await readFile(new URL("src/components/Screen.tsx", appRoot), "utf8");
  const layout = await readFile(new URL("app/_layout.tsx", appRoot), "utf8");
  const context = await readFile(new URL("src/ProDemoContext.tsx", appRoot), "utf8");

  assert.match(primitives, /onPress: \(\) => void/);
  assert.doesNotMatch(primitives, /onPress\s*=\s*\(\)\s*=>/);
  assert.match(screen, /react-native-safe-area-context/);
  assert.match(layout, /SafeAreaProvider/);
  assert.match(context, /getProViewModel/);
  const packageJson = JSON.parse(await readFile(new URL("package.json", appRoot), "utf8"));
  assert.equal(packageJson.type, "module");
});

test("CKare Pro Home renders the status-aware work-action label", async () => {
  const home = await readFile(new URL("app/(tabs)/index.tsx", appRoot), "utf8");
  assert.match(home, /view\.homeWorkAction\.label/);
  assert.match(home, /view\.homeWorkAction\.disabled/);
});
