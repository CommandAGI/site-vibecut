# site-vibecut

The site of VibeCut, a browser-native video editor you cut by describing the edit, and a company of CommandAGI
(`org-vibecut`). A static folder served by CommandAGI's site hosting, live at https://vibecut.commandagi.app, and
mounted in the CommandAGI repository at `seed/drive/platform/org-vibecut/sites/vibecut`.

## what is here

- `index.html`, `es/index.html`, `zh/index.html`: the site, in English, Spanish and Simplified Chinese. One page per
  language, the A/文 picker (the same glyph as CommandAGI's public sites) and `hreflang` alternates. `vibecut.me` is
  the brand's primary domain and serves the English page; a country-code domain would serve its own language's page.
- `app/app.mjs`: the editor. It cuts the description, draws the timeline, plays the cut on a canvas, downloads the
  cut as JSON, and renders the cut to a video file with `MediaRecorder`.
- `app/footage.mjs`, `media/`: the sample footage. Seven short clips generated for this page (fal; prompts, model and
  cost in `redesign/NOTES.md`), AV1 WebM with an H.264 fallback and a poster each, drawn into the editor's canvas.
- `app/scenes.mjs`: the eight shots drawn on a canvas, each a function of time: the end card, and the frame shown
  until a clip loads.
- `app/reels.mjs`: the reel at the foot of the page (scroll timecode, current reel) and the looping clips, which play
  only on screen and never under reduced motion.
- `app/i18n.mjs`: the demo's own words in the three languages, and the names of the eight shots.
- `lib/edl.mjs`: the cut engine, pure. A description becomes an edit decision list: shots, in and out points, speed,
  the frame (scope 2.39:1 unless the words ask for 16:9, square or vertical), and the reasons for each choice. No model call: the words match the footage deterministically, so the same
  description always cuts the same way and the demo works offline.
- `style.css`, `fonts/` (Big Shoulders, Hanken Grotesk, DM Mono; latin subsets, self-hosted), `wordmark.svg`,
  `mark.svg`, `touch-icon.png`, `og.png`: the look. The design is `redesign/DESIGN.md`; the audit `redesign/CONTENT.md`.
- `redesign/pages.mjs`: writes the three pages from one template (`node redesign/pages.mjs`).
- `site.json`: the site's manifest for CommandAGI's site hosting (slug `vibecut`).

## tests

```
node --test tests/edl.test.mjs     the cut engine: length, exclusions, order, pace, slow motion, the cut file
node tests/browser.mjs             the page in Chromium, over the DevTools protocol: en, es and zh, from a blank visit
node tests/browser.mjs https://vibecut.commandagi.app   the live site, the same checks
```

`tests/browser.mjs` needs Chromium (`CHROMIUM=/path/to/chromium` to choose) and Node 22+ for its own WebSocket. It
serves this folder itself, so nothing else has to run. `SHOT_DIR=/tmp` keeps its screenshots.

## deploy

```
commandagi sites deploy . --prod      from this folder: builds here, uploads, production
commandagi sites domains vibecut add vibecut.me
```

## next

Your own footage, cuts of an hour, and a render that is faster than real time. The engine's vocabulary is the sample
footage in `lib/edl.mjs`: a clip catalog and a list of words per kind of shot and subject.
