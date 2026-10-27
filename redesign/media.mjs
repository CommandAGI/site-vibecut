// VibeCut's generated footage: one fal text-to-video call per sample shot, then ffmpeg makes the web cuts.
// The key comes from the .env cascade (COMMANDAGI_ENV_ROOT), is sent only to fal and is never printed or written.
//
//   COMMANDAGI_ENV_ROOT=/path/to/commandagi node redesign/media.mjs [clip …]   generate (skips clips already in raw/)
//   node redesign/media.mjs --encode                                             only re-encode raw/ into media/
//
// Raw downloads stay in redesign/.raw/ (ignored, and a dot folder is never served); what the site serves is
// media/<clip>.webm (AV1), media/<clip>.mp4 (H.264, the fallback) and media/<clip>.webp (the poster).
// FFMPEG names an ffmpeg with libaom, libx264 and libwebp (the imageio-ffmpeg wheel's has them).
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = resolve(fileURLToPath(new URL('..', import.meta.url)));
const RAW = join(SITE, 'redesign', '.raw');
const OUT = join(SITE, 'media');
const MODEL = 'fal-ai/kling-video/v2.5-turbo/pro/text-to-video';

// One art direction for every clip: a small studio shot on 35mm under tungsten, anamorphic, no faces.
const LOOK = 'shot on 35mm film, anamorphic lens, tungsten practical light, deep crushed blacks, soft halation, fine grain, slow deliberate camera, muted ivory and vermilion palette, cinematic, no text, no logos, no faces';
export const CLIPS = {
    'dawn-studio': 'Empty small fabrication studio at dawn, cold blue window light slowly warming, dust floating in a light beam over a wooden workbench, a still robot arm in silhouette, slow push in',
    'studio-wide': 'Wide shot from behind of two people at a long wooden workbench in a dim studio, seen only as dark silhouettes against a bright window, tools and a small robot arm on the bench, slow lateral dolly',
    'arm-stack': 'Small white desktop robot arm precisely stacking wooden blocks on a dark workbench, close medium shot, warm tungsten key light, slow orbit',
    'lathe-turn': 'Macro shot of a metal part spinning on a small lathe, a fine curl of bright swarf peeling off, sparks of reflected light, shallow depth of field',
    'lens-hands': 'Extreme close-up of hands turning the focus ring of a vintage cinema lens, brass and black metal, shallow depth of field, warm light, no face visible',
    'coffee-steam': 'Close-up of a black ceramic coffee cup on a workbench, steam curling up through a beam of window light, dark background',
    'city-night': 'City at night seen from a high studio window, rain on the glass, blurred red and amber lights below, slow focus pull from the raindrops to the city',
};

async function key() {
    const root = process.env.COMMANDAGI_ENV_ROOT;
    if (!root) throw new Error('set COMMANDAGI_ENV_ROOT to the folder whose .env holds SVC__FAL__MAIN__API_KEY');
    for (const file of ['.env.api', '.env']) {
        const text = await readFile(join(root, file), 'utf8').catch(() => '');
        const line = text.split('\n').find(l => l.startsWith('SVC__FAL__MAIN__API_KEY='));
        if (line) return line.slice(line.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '');
    }
    throw new Error('SVC__FAL__MAIN__API_KEY is not in the cascade');
}

const exists = p => access(p).then(() => true, () => false);
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function generate(name, secret) {
    const raw = join(RAW, `${name}.mp4`);
    if (await exists(raw)) return console.log(`have ${name}`);
    const headers = { authorization: `Key ${secret}`, 'content-type': 'application/json' };
    const body = { prompt: `${CLIPS[name]}. ${LOOK}`, duration: '5', aspect_ratio: '16:9', negative_prompt: 'text, watermark, logo, faces, blur, distortion, cartoon', cfg_scale: 0.5 };
    const queued = await (await fetch(`https://queue.fal.run/${MODEL}`, { method: 'POST', headers, body: JSON.stringify(body) })).json();
    if (!queued.status_url) throw new Error(`${name}: ${JSON.stringify(queued).slice(0, 300)}`);
    for (;;) {
        await sleep(5000);
        const status = await (await fetch(queued.status_url, { headers })).json();
        if (status.status === 'COMPLETED') break;
        if (status.status !== 'IN_QUEUE' && status.status !== 'IN_PROGRESS') throw new Error(`${name}: ${JSON.stringify(status).slice(0, 300)}`);
    }
    const result = await (await fetch(queued.response_url, { headers })).json();
    const url = result.video?.url;
    if (!url) throw new Error(`${name}: no video in ${JSON.stringify(result).slice(0, 300)}`);
    await writeFile(raw, Buffer.from(await (await fetch(url)).arrayBuffer()));
    console.log(`made ${name} (${MODEL}, 5 s)`);
}

const FFMPEG = process.env.FFMPEG ?? 'ffmpeg';

function encode(name) {
    const raw = join(RAW, `${name}.mp4`);
    const ff = args => execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-i', raw, '-an', ...args]);
    // 960 wide holds the editor's screen at 1440 css px; the 2.39:1 crop is the page's own, so the file stays 16:9.
    const vf = ['-vf', 'scale=960:-2:flags=lanczos,fps=24'];
    ff([...vf, '-c:v', 'libaom-av1', '-crf', '40', '-b:v', '0', '-cpu-used', '6', '-row-mt', '1', '-pix_fmt', 'yuv420p', join(OUT, `${name}.webm`)]);
    ff([...vf, '-c:v', 'libx264', '-profile:v', 'high', '-crf', '30', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', join(OUT, `${name}.mp4`)]);
    execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-ss', '2.5', '-i', raw, '-frames:v', '1', '-vf', 'scale=960:-2', '-c:v', 'libwebp', '-quality', '62', join(OUT, `${name}.webp`)]);
    console.log(`encoded ${name}`);
}

await mkdir(RAW, { recursive: true });
await mkdir(OUT, { recursive: true });
const names = process.argv.slice(2).filter(a => !a.startsWith('--'));
const which = names.length ? names : Object.keys(CLIPS);
if (!process.argv.includes('--encode')) {
    const secret = await key();
    await Promise.all(which.map(n => generate(n, secret).catch(e => console.error(e.message))));
}
for (const n of which) if (await exists(join(RAW, `${n}.mp4`))) encode(n);
