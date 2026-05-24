# Wall Live Browser Extension

MIT licensed. Replaces stale `wall.app` link previews with live PNG renders.

## Build

```bash
cd extension
npx esbuild content.ts --bundle --outfile=content.js --format=esm
npx esbuild background.ts --bundle --outfile=background.js --format=esm
npx esbuild popup.ts --bundle --outfile=popup.js --format=esm
```

Load unpacked in Chrome → `extension/` folder.

## Privacy

- Only activates on opt-in domains (LinkedIn on by default)
- Fetches public `.png` URLs only — no tracking
