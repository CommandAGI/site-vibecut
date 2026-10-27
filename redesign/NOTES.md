# VibeCut redesign: notes

## generated media (fal)

Script: `redesign/media.mjs` (the key comes from the .env cascade, `COMMANDAGI_ENV_ROOT`; never in the client).
Model: `fal-ai/kling-video/v2.5-turbo/pro/text-to-video`, $0.07 per second (fal's pricing API, 2026-10-26).
Seven clips × 5 s = 35 s = **$2.45**. No retries, no stills bought (posters are frames of the clips; the OG image and
touch icon are rendered here from the site's own files). Budget: $15.

Every prompt ends with the shared look: "shot on 35mm film, anamorphic lens, tungsten practical light, deep crushed
blacks, soft halation, fine grain, slow deliberate camera, muted ivory and vermilion palette, cinematic, no text, no
logos, no faces". Negative prompt: "text, watermark, logo, faces, blur, distortion, cartoon". 16:9, cfg 0.5.

| clip | prompt |
|---|---|
| dawn-studio | Empty small fabrication studio at dawn, cold blue window light slowly warming, dust floating in a light beam over a wooden workbench, a still robot arm in silhouette, slow push in |
| studio-wide | Wide shot from behind of two people at a long wooden workbench in a dim studio, seen only as dark silhouettes against a bright window, tools and a small robot arm on the bench, slow lateral dolly |
| arm-stack | Small white desktop robot arm precisely stacking wooden blocks on a dark workbench, close medium shot, warm tungsten key light, slow orbit |
| lathe-turn | Macro shot of a metal part spinning on a small lathe, a fine curl of bright swarf peeling off, sparks of reflected light, shallow depth of field |
| lens-hands | Extreme close-up of hands turning the focus ring of a vintage cinema lens, brass and black metal, shallow depth of field, warm light, no face visible |
| coffee-steam | Close-up of a black ceramic coffee cup on a workbench, steam curling up through a beam of window light, dark background |
| city-night | City at night seen from a high studio window, rain on the glass, blurred red and amber lights below, slow focus pull from the raindrops to the city |

Encoding (`node redesign/media.mjs --encode`, FFMPEG = an ffmpeg with libaom/libx264/libwebp): 960 px, 24 fps, AV1
CRF 40 in WebM, H.264 CRF 30 in MP4, a WebP poster at 2.5 s. Raw downloads stay in `redesign/.raw/` (ignored).

## other generated files

- `wordmark.svg`, `mark.svg`: outlined from Big Shoulders at 900 with fontTools (hand tracking, "CUT" dropped as a jump
  cut, a vermilion splice). `touch-icon.png`, `og.png`: rendered with Playwright from the site's own files.
- `index.html`, `es/index.html`, `zh/index.html`: written by `node redesign/pages.mjs` from one template.

## checks

- `node --test tests/edl.test.mjs`: the engine, with the frame words.
- `node tests/browser.mjs [url]`: the three pages in Chromium: cut, play, reframe to 9:16, the footage loads, render a
  WebM and download it.
- Screenshots at 1440, 768, 390, 320 and reduced motion: `redesign/.shots/`.
