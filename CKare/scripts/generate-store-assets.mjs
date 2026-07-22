import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const apps = [
  { id: "ckare-pro", title: "CKare Pro", strapline: "Qualified work. Clear next steps.", accent: "#E86F51" },
  { id: "ckare-care", title: "CKare Care", strapline: "Coverage clarity. Care that fits.", accent: "#287263" },
];

for (const app of apps) {
  const assets = path.join(root, "apps", app.id, "assets");
  const store = path.join(root, "store-assets", app.id);
  await mkdir(store, { recursive: true });
  await mkdir(path.join(store, "screenshots"), { recursive: true });
  await sharp(path.join(assets, "icon.svg")).resize(1024, 1024).flatten({ background: "#F7F3EA" }).png().toFile(path.join(assets, "icon.png"));
  await sharp(path.join(assets, "adaptive-icon.svg")).resize(1024, 1024).png().toFile(path.join(assets, "adaptive-icon.png"));
  await sharp(path.join(assets, "splash.svg")).resize(2048, 2048).png().toFile(path.join(assets, "splash.png"));
  await sharp(path.join(assets, "notification-icon.svg")).resize(96, 96).png().toFile(path.join(assets, "notification-icon.png"));
  const feature = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500"><rect width="1024" height="500" fill="#F7F3EA"/><circle cx="850" cy="250" r="218" fill="${app.accent}" opacity=".18"/><circle cx="850" cy="250" r="132" fill="${app.accent}"/><path d="M906 166a108 108 0 1 0 0 168" fill="none" stroke="#F7F3EA" stroke-width="44" stroke-linecap="round"/><circle cx="912" cy="168" r="20" fill="#E8C66A"/><text x="70" y="215" fill="#17342F" font-family="Georgia,serif" font-size="76" font-weight="700">${app.title}</text><text x="72" y="282" fill="#58706A" font-family="Arial,sans-serif" font-size="29">${app.strapline}</text></svg>`;
  await sharp(Buffer.from(feature)).png().toFile(path.join(store, "play-feature.png"));
  for (const frame of ["ios-6.9", "android-phone"]) {
    await sharp(path.join(store, "screenshots", `${frame}-source.svg`)).png().toFile(path.join(store, "screenshots", `${frame}.png`));
  }
}

console.log("Generated CKare store PNG assets.");
