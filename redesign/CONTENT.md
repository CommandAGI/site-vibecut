# VibeCut: the audit (2026-10-26)

What the site is and does before the 2027 redesign, so the redesign keeps every working thing.

## routes

- `/` (English), `/es/` (Spanish), `/zh/` (Simplified Chinese). One page each, `hreflang` alternates, canonical.
- No other route, no form that posts, no auth. `mailto:hello@vibecut.me` is the only contact.
- The page's policy (CSP meta): `default-src 'self'`, `connect-src 'none'`, no inline script. It stays.

## working features (all kept)

| feature | where | kept as |
|---|---|---|
| describe a cut, press Cut it | `#cut-form`, `#description` | the instruction line under the screen |
| four presets (two in other languages) | `[data-preset]` | "takes" under the instruction line |
| the cut engine: length, shots, subjects, pace, slow motion, exclusions, first/last | `lib/edl.mjs` | unchanged, plus a frame word (scope, 16:9, square, vertical) |
| the preview plays the cut on a canvas | `#preview` | the screen, now drawing generated footage, cropped to the cut's frame |
| the timeline: a block per shot, click to seek, a playhead | `#timeline` | a strip of frames from each shot |
| why this cut (reasons in the visitor's language) | `#why` | a column beside the edit decision list |
| download the cut as JSON | `#download` | kept, file now records the frame |
| render a video (MediaRecorder, real time) | `#export` | kept; the record red appears only while it records |
| the A/文 language dialog and the language hint | `.lang-btn`, `dialog#lang`, `#lang-hint` | kept, restyled |
| the skip link | `.skip` | kept |

## what is a demo

- The footage is sample footage. Before: eight shots drawn on a canvas. After: seven of them are short clips
  generated for this page (fal, Kling 2.5 Turbo Pro), the end card is still drawn. The canvas drawings stay as the
  frame the screen shows while a clip loads, and when a clip cannot play.
- The engine is deterministic word matching, not a model. The page says so.

## claims (all true, all kept, none added)

- Free while in beta. No sign-in, no upload; the engine and the footage are in the page.
- English, Spanish and Simplified Chinese.
- Studio (your own footage, hour-long cuts) is "later", priced at nothing yet.

No testimonials, logos, user counts or ratings exist and none are added. New disclosure: the footage is generated and
shows no real studio, person or event.
