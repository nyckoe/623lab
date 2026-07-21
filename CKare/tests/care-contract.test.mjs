import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const appRoot = new URL("../apps/ckare-care/", import.meta.url);

test("CKare Care has independent store identity and five tab routes", async () => {
  const config = JSON.parse(await readFile(new URL("app.json", appRoot), "utf8"));
  assert.equal(config.expo.name, "CKare Care");
  assert.equal(config.expo.slug, "ckare-care");
  assert.equal(config.expo.scheme, "ckarecare");
  assert.equal(config.expo.ios.bundleIdentifier, "com.ckare.care");
  assert.equal(config.expo.android.package, "com.ckare.care");
  assert.equal(config.expo.icon, "./assets/icon.png");
  assert.equal(config.expo.android.adaptiveIcon.foregroundImage, "./assets/adaptive-icon.png");

  const routes = ["index.tsx", "find-care.tsx", "visits.tsx", "coverage.tsx", "profile.tsx"];
  await Promise.all(routes.map((route) => access(new URL(`app/(tabs)/${route}`, appRoot))));
});

test("CKare Care exposes release build profiles", async () => {
  const eas = JSON.parse(await readFile(new URL("eas.json", appRoot), "utf8"));
  assert.equal(eas.build.production.autoIncrement, true);
  assert.deepEqual(eas.submit.production, {});
});

test("CKare Care screens preserve household, safety, and coverage boundaries", async () => {
  const files = await Promise.all(
    ["index.tsx", "find-care.tsx", "visits.tsx", "coverage.tsx", "profile.tsx"].map((name) =>
      readFile(new URL(`app/(tabs)/${name}`, appRoot), "utf8"),
    ),
  );
  const source = `${files.join("\n")}\n${await readFile(new URL("src/data/demo.ts", appRoot), "utf8")}`;
  for (const phrase of [
    "Care for Maya",
    "emergency services",
    "Provider credentials verified",
    "Estimated responsibility",
    "Authorization approved",
    "does not guarantee payment",
    "Delete account",
  ]) {
    assert.match(source, new RegExp(phrase, "i"), `missing ${phrase}`);
  }
});

test("CKare Care wires household context, required actions, and safe areas", async () => {
  const primitives = await readFile(new URL("src/components/Primitives.tsx", appRoot), "utf8");
  const screen = await readFile(new URL("src/components/Screen.tsx", appRoot), "utf8");
  const layout = await readFile(new URL("app/_layout.tsx", appRoot), "utf8");
  const context = await readFile(new URL("src/CareDemoContext.tsx", appRoot), "utf8");

  assert.match(primitives, /onPress: \(\) => void/);
  assert.doesNotMatch(primitives, /onPress\s*=\s*\(\)\s*=>/);
  assert.match(screen, /react-native-safe-area-context/);
  assert.match(layout, /SafeAreaProvider/);
  assert.match(layout, /CareDemoProvider/);
  assert.match(context, /getCareViewModel/);
  const packageJson = JSON.parse(await readFile(new URL("package.json", appRoot), "utf8"));
  assert.equal(packageJson.type, "module");
});

test("CKare Care renders the emergency view without marketplace controls", async () => {
  const findCare = await readFile(new URL("app/(tabs)/find-care.tsx", appRoot), "utf8");
  assert.match(findCare, /view\.findCare\.mode === "emergency"/);
  assert.match(findCare, /view\.findCare\.match/);
  assert.match(findCare, /view\.findCare\.booking/);
  assert.doesNotMatch(findCare, /useState/);
  assert.match(findCare, /value=\{view\.requestText\}/);
  assert.match(findCare, /type: "update-care-request-text"/);
});
