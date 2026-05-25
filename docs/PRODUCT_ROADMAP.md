# Wall product roadmap — audit vs recommendations

Last updated after paste-router + poll/code/chart/calendar/map batch.

## Shipped and confirmed

| Area | Status |
|------|--------|
| Paste router (`src/paste/router.ts` + `execute.ts`) | **Shipped** — image/audio files, URL→embed/asset/RSS/Cal/code/chart/link, code fences, sticky |
| Paste tests (`tests/paste-router.test.ts`) | **Shipped** — expand toward 30+ fixtures over time |
| Poll element | **Shipped** — `PollElement`, reactions keys `poll:{id}:{option}`, sessionStorage one vote |
| Code card (Carbon-style) | **Shipped** — styled code host; not remote Carbon PNG (see gaps) |
| QuickChart | **Shipped** — paste chart JSON or quickchart.io URL → image |
| OSM map embed | **Shipped** — iframe embed, no Leaflet bundle yet |
| Cal.com embed | **Shipped** — paste `cal.com/...` routes to calendar iframe |
| Scribble / draw | **Shipped** — tldraw draw tool + DrawBrushPanel |
| oEmbed (8 providers) + Microlink fallback | **Shipped** |
| Spotify playlist embed | **Shipped** — via oEmbed / paste `embed` route |
| Spotify Now Playing | **Shipped** — OAuth widget (separate from playlist paste) |
| Community theme JSON | **Shipped** — `public/themes/` + AI generator in Theme picker |
| RSS widgets | **Shipped** — generic `rss` widget |
| Phase B/C integrations | **Shipped** — Jamendo, GitHub stats, Strava token, Open-Meteo polish |

## High-leverage next (your week plan) — status

| Day | Item | Status |
|-----|------|--------|
| 1 | Paste router + tests | **Done** (add more fixtures as you paste real clipboard samples) |
| 2 | Poll element | **Done** |
| 3 | Carbon + QuickChart | **Partial** — QuickChart done; Carbon = local code card, not URL PNG |
| 4 | Leaflet map + Cal.com | **Partial** — Cal done; map = OSM iframe (not Leaflet) |
| 5 | Composable theme layers | **Not started** |
| 6 | Mini-wall, countdown, markdown-sticky | **Not started** |
| 7 | Living themes (time-of-day) | **Not started** |

## Correctly deprioritized (agree)

- **More oEmbed sites** — stop at 8 + Microlink; add only when clipboard testing proves demand.
- **Last.fm RSS** — no reliable keyless feed in 2026.
- **TimeAPI** — client `Intl` clocks are enough.
- **OmniBar tab merge** — tabs = discovery, paste = intent; keep both.
- **Wall network / chat / B2B verticals** — out of scope for now.
- **More media providers before paste** — discipline call accepted.

## Gaps vs your element ideas

| Element | Status | Notes |
|---------|--------|-------|
| Carbon URL → image | Gap | Code card is local CSS; add Carbonara/proxy if PNG in OG wall is required |
| Leaflet + marker config | Gap | OSM iframe works; upgrade when you want drag markers / custom tiles |
| Embedded mini-canvas | Not started | High viral potential |
| Bookmark tower | Not started | |
| Markdown sticky | Not started | |
| Countdown sticker | Not started | |
| Then-and-now slider | Not started | Strong differentiator |
| Audio waveform sticker | Not started | |
| Animated text | Not started | |
| SVG sketch export | Partial | Draw exists; confirm SVG export for OG pipeline |
| Photo strip | Not started | |
| Mood ring | Not started | |
| Wall modes (public / résumé / today) | Not started | High expressive value, small schema extension |
| Per-element `themeOverride` | Not started | |
| Composable themes (Surface × Palette × …) | Not started | Best long-term theme strategy |
| Surface physics (curl, magnets, parallax) | Not started | Distinctive aesthetic |
| Living themes (time-of-day) | Not started | |

## How to extend paste routing

1. Paste a URL in the editor — note where it lands.
2. If wrong, add a test case in `tests/paste-router.test.ts` and a branch in `classifyUrl` / `classifyText`.
3. Wire execution in `src/paste/execute.ts` only — keep router pure.

## Contributor themes

Add JSON under `public/themes/` and list in `public/themes/manifest.json`. No upload UI — PR-only, as agreed.
