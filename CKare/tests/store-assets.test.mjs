import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = new URL("../", import.meta.url);

test("both apps include self-contained approved artwork sources", async () => {
  const sources = [
    "store-assets/shared/brand-source.svg",
    "apps/ckare-pro/assets/icon.svg",
    "apps/ckare-pro/assets/adaptive-icon.svg",
    "apps/ckare-pro/assets/splash.svg",
    "apps/ckare-care/assets/icon.svg",
    "apps/ckare-care/assets/adaptive-icon.svg",
    "apps/ckare-care/assets/splash.svg",
  ];
  for (const relative of sources) {
    const svg = await readFile(new URL(relative, root), "utf8");
    assert.match(svg, /<title(?:\s[^>]*)?>[^<]+<\/title>/i, `${relative} needs a title`);
    assert.doesNotMatch(svg, /(?:href|src)=["']https?:\/\//i, `${relative} must be self-contained`);
    assert.match(svg, /#17342F|#F7F3EA|#E86F51|#287263/i, `${relative} must use CKare colors`);
  }
});

test("generated store PNGs exist at submission dimensions", async () => {
  const outputs = [
    "apps/ckare-pro/assets/icon.png",
    "apps/ckare-pro/assets/adaptive-icon.png",
    "apps/ckare-pro/assets/splash.png",
    "apps/ckare-care/assets/icon.png",
    "apps/ckare-care/assets/adaptive-icon.png",
    "apps/ckare-care/assets/splash.png",
    "store-assets/ckare-pro/play-feature.png",
    "store-assets/ckare-care/play-feature.png",
  ];
  await Promise.all(outputs.map((relative) => access(new URL(relative, root))));
});

test("iOS icons are fully opaque 1024px squares and notification icons remain Android-safe", async () => {
  for (const app of ["ckare-pro", "ckare-care"]) {
    const icon = sharp(fileURLToPath(new URL(`apps/${app}/assets/icon.png`, root)));
    const { data, info } = await icon.raw().toBuffer({ resolveWithObject: true });
    assert.equal(info.width, 1024, `${app} iOS icon width`);
    assert.equal(info.height, 1024, `${app} iOS icon height`);
    assert.ok([3, 4].includes(info.channels), `${app} iOS icon has RGB channels`);
    if (info.channels === 4) {
      for (let offset = 3; offset < data.length; offset += 4) assert.equal(data[offset], 255, `${app} iOS icon alpha at ${offset}`);
    }

    const notification = sharp(fileURLToPath(new URL(`apps/${app}/assets/notification-icon.png`, root)));
    const rendered = await notification.raw().toBuffer({ resolveWithObject: true });
    assert.equal(rendered.info.width, 96, `${app} notification icon width`);
    assert.equal(rendered.info.height, 96, `${app} notification icon height`);
    assert.equal(rendered.info.channels, 4, `${app} notification icon RGBA`);
    let transparentPixels = 0;
    let visiblePixels = 0;
    for (let offset = 0; offset < rendered.data.length; offset += 4) {
      const alpha = rendered.data[offset + 3];
      if (alpha === 0) transparentPixels += 1;
      else {
        visiblePixels += 1;
        assert.deepEqual([...rendered.data.subarray(offset, offset + 3)], [255, 255, 255], `${app} notification foreground is white`);
      }
    }
    assert.ok(transparentPixels > 0, `${app} notification icon keeps transparent background`);
    assert.ok(visiblePixels > 0, `${app} notification icon has a visible foreground`);
  }
});

test("reproducible fictional phone screenshots exist at enabled listing dimensions", async () => {
  const frames = [
    ["ios-6.9", 1320, 2868],
    ["android-phone", 1080, 1920],
  ];
  for (const app of ["ckare-pro", "ckare-care"]) {
    for (const [name, width, height] of frames) {
      const source = await readFile(new URL(`store-assets/${app}/screenshots/${name}-source.svg`, root), "utf8");
      assert.match(source, /fictional/i, `${app} ${name} source names fictional data`);
      assert.doesNotMatch(source, /(?:href|src)=["']https?:\/\//i, `${app} ${name} source is self-contained`);
      const metadata = await sharp(fileURLToPath(new URL(`store-assets/${app}/screenshots/${name}.png`, root))).metadata();
      assert.equal(metadata.width, width, `${app} ${name} width`);
      assert.equal(metadata.height, height, `${app} ${name} height`);
    }
  }
});
