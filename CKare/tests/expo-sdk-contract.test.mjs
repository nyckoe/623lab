import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const appRoots = ["apps/ckare-pro/", "apps/ckare-care/"];

test("mobile workspaces use Expo SDK 57 compatible native dependency versions", async () => {
  for (const appRoot of appRoots) {
    const pkg = JSON.parse(await readFile(new URL(`${appRoot}package.json`, root), "utf8"));
    assert.equal(pkg.dependencies.react, "19.2.3");
    assert.equal(pkg.dependencies["react-dom"], "19.2.3");
    assert.equal(pkg.dependencies["react-native"], "0.86.0");
    assert.equal(pkg.dependencies["react-native-web"], "~0.21.0");
    assert.equal(pkg.dependencies["react-native-safe-area-context"], "~5.7.0");
    assert.equal(pkg.dependencies["react-native-screens"], "4.25.2");
    assert.equal(pkg.dependencies["expo-splash-screen"], "~57.0.2");
    assert.equal(pkg.dependencies["expo-constants"], "~57.0.6");
    assert.equal(pkg.dependencies["expo-linking"], "~57.0.3");
    assert.equal(pkg.dependencies["expo-notifications"], "~57.0.5");
    assert.equal(pkg.devDependencies.typescript, "~6.0.3");
  }
});

test("mobile configs declare local Expo notification artwork without owner credentials", async () => {
  for (const appRoot of appRoots) {
    const config = JSON.parse(await readFile(new URL(`${appRoot}app.json`, root), "utf8")).expo;
    const notification = config.plugins.find((plugin) => Array.isArray(plugin) && plugin[0] === "expo-notifications");
    assert.deepEqual(notification?.[1], {
      icon: "./assets/notification-icon.png",
      color: "#E86F51",
      defaultChannel: "care-updates",
    });
    assert.equal(config.ios.supportsTablet, false, `${appRoot} only has phone screenshot support`);
  }
});

test("mobile environment templates name only owner-supplied configuration", async () => {
  for (const appRoot of appRoots) {
    const template = await readFile(new URL(`${appRoot}.env.example`, root), "utf8");
    for (const variable of ["EXPO_PUBLIC_SUPABASE_URL", "EXPO_PUBLIC_SUPABASE_ANON_KEY", "EXPO_PUBLIC_EAS_PROJECT_ID"]) {
      assert.match(template, new RegExp(`^${variable}=YOUR_OWNER_SUPPLIED_`, "m"), `${appRoot}${variable} placeholder`);
    }
    assert.match(template, /owner-supplied/i, `${appRoot} documents ownership`);
    assert.doesNotMatch(template, /https:\/\/[^\s]+/i, `${appRoot} does not include a production URL`);
  }
  const gitignore = await readFile(new URL(".gitignore", root), "utf8");
  assert.match(gitignore, /^\.env\*$/m);
  assert.match(gitignore, /^!\*\*\/\.env\.example$/m);
});

test("mobile app configs use the supported splash-screen config plugin", async () => {
  for (const appRoot of appRoots) {
    const config = JSON.parse(await readFile(new URL(`${appRoot}app.json`, root), "utf8")).expo;
    assert.equal(config.splash, undefined);
    assert.equal(config.newArchEnabled, undefined);
    assert.ok(config.plugins.includes("expo-router"));
    const splash = config.plugins.find((plugin) => Array.isArray(plugin) && plugin[0] === "expo-splash-screen");
    assert.deepEqual(splash?.[1], {
      image: "./assets/splash.png",
      imageWidth: 200,
      resizeMode: "contain",
      backgroundColor: "#F7F3EA",
    });
  }
});

test("mobile apps are isolated from the web workspace React runtime", async () => {
  const rootPackage = JSON.parse(await readFile(new URL("package.json", root), "utf8"));
  assert.deepEqual(rootPackage.workspaces, ["packages/*"]);
  for (const appRoot of appRoots) {
    const pkg = JSON.parse(await readFile(new URL(`${appRoot}package.json`, root), "utf8"));
    assert.equal(pkg.dependencies["@ckare/core"], "file:../../packages/core");
    assert.equal(pkg.dependencies["@ckare/design"], "file:../../packages/design");
  }
});

test("Expo Doctor scripts preserve each app directory as the diagnostic cwd", async () => {
  const rootPackage = JSON.parse(await readFile(new URL("package.json", root), "utf8"));
  assert.equal(rootPackage.scripts["doctor:pro"], "npm --prefix apps/ckare-pro run doctor");
  assert.equal(rootPackage.scripts["doctor:care"], "npm --prefix apps/ckare-care run doctor");
  for (const appRoot of appRoots) {
    const pkg = JSON.parse(await readFile(new URL(`${appRoot}package.json`, root), "utf8"));
    assert.equal(pkg.scripts.doctor, "npx expo-doctor");
  }
});
