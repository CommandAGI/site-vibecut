# VibeCut 2027: the screening room

Designer: a film title designer who spent years as an assistant editor. The brief's row (docs/design/startup-redesign-2027.md
§4): letterboxed 2.39:1, cuts, timecode; dark only; Big Shoulders / Hanken Grotesk / DM Mono; projection black,
film ivory, tungsten/vermilion, record red only for live.

## concept

The page is a screening room with the editor's bench under the screen. You arrive in the dark, the picture is already
up, and the opening title sits on it. Under the screen is the deck: transport, a strip of real frames, the line where
you type the cut. Below that the page runs like the rest of a film: one interstitial, three plates, a contact sheet,
the end credits (where the prices are), and "Fin."

The product is the picture: the hero is the working editor, playing generated footage. Type "vertical" and the screen
reframes to 9:16; type "no coffee" and the strip re-lays without it.

## type

- Big Shoulders (wght 500–900): titles only, uppercase, 900 for the opening title, 800 for section titles, 700 for keys.
  Leading 0.82–0.9: title cards are set tight.
- Hanken Grotesk (300–700): every sentence. 17 px base. `text-wrap: pretty`.
- DM Mono (400/500): timecode, slate, labels, the EDL. Tabular numerals everywhere a number moves.
- Scale: about 1.5 from 17 px: 12 (labels) · 17 · 26 · 40 · 60 · 96 · 156 (title). Fluid with `clamp()`.
- Chinese: the display lines fall back to PingFang / Noto Sans SC at 900 with open leading; the text face's metrics
  carry the rest.

## colour (OKLCH, sRGB fallbacks first), measured contrast on projection black #101010

| role | value | contrast |
|---|---|---|
| projection black (room) | oklch(0.178 0 0) #101010 | — |
| well (behind the screen) | #050505 | — |
| film ivory (text, picture light) | oklch(0.954 0.011 88) #f3f0e8 | 16.7:1 |
| ivory 2 (secondary) | oklch(0.71 0.013 85) #a8a49b | 7.7:1 |
| vermilion (the editor's mark: playhead, focus, primary key, numbers) | oklch(0.64 0.215 32) #f0442c | 5.05:1 (black on it: 5.05:1) |
| tungsten (close shots, edge codes) | oklch(0.77 0.12 68) #e9a65a | 9.1:1 |
| record red (only while a render records) | #ff2a3c | — |

## layout

- 1440 and 2560: slate bar (wordmark, slate meta, A/文); the screen at full width, 2.39:1, at most 74svh tall; the
  title card over its lower left; the deck under it in two columns (command and reasons left, EDL right).
- 768: the same screen; the deck is one column; the contact sheet is two frames wide; plates still stack (sticky).
- 390: the screen keeps its 2.39 frame inside a 64vw well (letterbox bars above and below); the title card follows
  the picture instead of covering it; Cut it is full width; plates become picture-then-words; the contact sheet is one
  frame at a time in 2.39.
- 320: as 390; the reel shows R1–R4 and the timecode only.
- Radius: none, anywhere. Buttons are "keys" with crop marks at two corners that open on hover and focus.
- Nav: the reel, fixed at the foot: four reels as segments, a vermilion playhead that moves with the scroll
  (`animation-timeline: scroll(root)`, with a JS `--p` fallback) and a timecode that advances 24 frames a second of
  scroll. No top nav.

## motion

Hard cuts and short dissolves, nothing that bounces.
- Recut: a View Transition; the screen morphs to its new frame (scope ↔ 16:9 ↔ 1:1 ↔ 9:16), the strip re-lays.
- Play: the title card dissolves off the picture (it has done its job) and returns on pause.
- The interstitial's letterbox bars close from half-screen to 13% as it arrives (`view-timeline`).
- The contact sheet's frames develop (from overexposed to normal) as they enter.
- Loops play only on screen; the reel's head scrubs with the scroll.
- Reduced motion: no loop plays (posters stand), no scroll animation, no view transition, bars sit at 13%; the reel's
  head still moves (it is position, not motion). Nothing flashes; the REC dot blinks at 1 Hz.

## media

Seven generated clips, one per sample shot, so the editor cuts real moving pictures (redesign/NOTES.md has the
prompts, model and cost). Art direction: 35 mm, anamorphic, tungsten practicals, crushed blacks, no faces, no text.
Each is 5 s, 960 px, AV1 WebM with an H.264 MP4 fallback and a WebP poster; the seven together are 2.5 MB. The end
card is drawn on the canvas in the site's own type. The canvas drawings remain as the frame shown until a clip loads.

## signature moment

Type an instruction, press Cut it: the screen reframes, the strip of frames re-lays in the new order, the EDL rewrites
itself in timecode, and the reasons say why. Then Play.

## don'ts

No rounded anything, no gradient text, no glow, no cards with shadows, no icon sets, no fake reviews, no logo cloud,
no "AI" sparkle. Nothing generated is presented as a real studio, person or event; the page says so twice.

## scores (my own, from the screenshots in redesign/.shots/, not served)

| art direction | brand specificity | product expression | interaction | technical quality | craft |
|---|---|---|---|---|---|
| 8 | 9 | 9 | 8 | 8 | 8 |

Average 8.3, nothing below 8.
