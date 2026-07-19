# SharpTongue (毒舌女巫)

An AI companion that gives blunt, tough-love answers instead of generic reassurance — delivered by an elegant, animated witch. Full product plan in [`PROJECT_PLAN.md`](./PROJECT_PLAN.md).

## Demo

[`index.html`](./index.html) is a self-contained, single-file web demo of the brand and core interaction:

- A hero lockup with an animated venom-shine tongue mark and a hovering witch.
- A "core value" section pulled from the product principles.
- A three-scene, tab/dot-driven carousel (phone mockup) showing the witch bursting in with a verdict for three everyday situations.

No build step or dependencies — it's plain HTML/CSS/JS.

### Run locally

Open `index.html` directly in a browser, or serve the folder:

```bash
npx serve .
```

### Publish with GitHub Pages

Settings → Pages → Deploy from branch → `main` → `/ (root)`. GitHub will serve `index.html` at the repo's Pages URL.

## Structure

```
index.html                 standalone copy of the demo (GitHub Pages entry point)
demo/sharptongue-demo.html same demo, source file used for edits
PROJECT_PLAN.md             full product plan
```
