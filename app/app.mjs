// The VibeCut demo: a description in, a cut out, played on the page. It sends nothing (the page's policy forbids
// connections): the cut engine, the sample footage and the playback are all in this folder.
import { cut, toFile } from '../lib/edl.mjs';
import { drawAt, fit, FRAME } from './scenes.mjs';
import { footage, poster } from './footage.mjs';
import { t, name, reasonSentence } from './i18n.mjs';

const locale = document.body.dataset.locale || 'en';
const root = document.body.dataset.root || '';
const $ = id => document.getElementById(id);

const form = $('cut-form');
const input = $('description');
const canvas = $('preview');
const ctx = canvas.getContext('2d');
const timeline = $('timeline');
const playButton = $('play');
const clock = $('clock');
const whyList = $('why');
const summary = $('summary');
const screen = $('screen');
const screening = document.querySelector('.screening');
const edl = $('edl');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const clips = footage(root, () => { if (!playing) paint(); });
const FRAME_NAMES = { scope: '2.39:1', '16:9': '16:9', square: '1:1', vertical: '9:16' };

let plan = null;
let at = 0;
let playing = false;
let raf = 0;
let lastFrame = 0;

input.placeholder = t(locale, 'cut.placeholder');

/** A cut's shot at a time in the cut: the shot, and the second of its source to draw. */
function shotAt(time) {
    if (!plan?.shots.length) return null;
    const shot = plan.shots.find(s => time >= s.start && time < s.end) ?? plan.shots[plan.shots.length - 1];
    const into = Math.max(0, time - shot.start);
    return { shot, source: shot.sourceIn + into * shot.rate };
}

function paint() {
    // The canvas takes the cut's frame at the screen's size (two device pixels at most, 1280 wide at most).
    const aspect = plan?.aspect ?? FRAME.width / FRAME.height;
    const density = Math.min(2, window.devicePixelRatio || 1);
    const width = Math.max(2, Math.min(1280, Math.round((canvas.clientWidth || 640) * density)));
    const height = Math.max(2, Math.round(width / aspect));
    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
    }
    const found = shotAt(at);
    const video = found ? clips.frame(found.shot, found.source, playing) : null;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (video) {
        // Cover: the clip fills the frame and the frame crops it, as a reframe does.
        const scale = Math.max(width / video.videoWidth, height / video.videoHeight);
        const w = video.videoWidth * scale;
        const h = video.videoHeight * scale;
        ctx.drawImage(video, (width - w) / 2, (height - h) / 2, w, h);
        ctx.setTransform(width / FRAME.width, 0, 0, width / FRAME.width, 0, 0);
    } else {
        fit(ctx, canvas);
        if (found) drawAt(ctx, found.shot, found.source);
        else {
            ctx.fillStyle = '#101010';
            ctx.fillRect(0, 0, FRAME.width, FRAME.height);
        }
        ctx.setTransform(width / FRAME.width, 0, 0, width / FRAME.width, 0, 0);
    }
    drawOverlay(found, FRAME.width, height * (FRAME.width / width));
    movePlayhead();
    clock.textContent = `${format(at)} / ${format(plan?.seconds ?? 0)}`;
}

/** The timecode and the shot's name, burnt over the picture as an editor's monitor shows them. */
function drawOverlay(found, w, h) {
    const s = Math.max(1, w / 1280 * (w / h < 1.2 ? 2.2 : 1));
    ctx.save();
    ctx.font = `500 ${Math.round(22 * s)}px "DM Mono", ui-monospace, monospace`;
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    const code = format(at);
    const codeWidth = ctx.measureText(code).width;
    ctx.fillRect(w - codeWidth - 44 * s, 18 * s, codeWidth + 24 * s, 36 * s);
    ctx.fillStyle = '#f3f0e8';
    ctx.fillText(code, w - codeWidth - 32 * s, 44 * s);
    if (found) {
        ctx.font = `500 ${Math.round(16 * s)}px "DM Mono", ui-monospace, monospace`;
        ctx.fillStyle = 'rgba(243,240,232,0.8)';
        ctx.textAlign = 'right';
        ctx.fillText(`${name(locale, 'shot', found.shot.shot).toUpperCase()} · ${name(locale, 'clip', found.shot.clip)}`, w - 32 * s, h - 28 * s);
    }
    ctx.restore();
}

function format(seconds) {
    const s = Math.max(0, Math.floor(seconds));
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}.${String(Math.floor((seconds % 1) * 10))}`;
}

/** Play, from the start when the cut has run to its end. */
function play() {
    if (!plan) return;
    if (at >= plan.seconds - 1e-3) at = 0;
    playing = true;
    screening?.classList.add('is-playing');
    playButton.textContent = t(locale, 'editor.pause');
    lastFrame = performance.now();
    cancelAnimationFrame(raf);
    const step = now => {
        if (!playing) return;
        const delta = Math.min(0.1, (now - lastFrame) / 1000);
        lastFrame = now;
        at += delta;
        if (at >= plan.seconds) {
            at = plan.seconds;
            playing = false;
            screening?.classList.remove('is-playing');
            clips.pauseAll();
            playButton.textContent = t(locale, 'editor.play');
        }
        paint();
        if (playing) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
}

function pause() {
    playing = false;
    screening?.classList.remove('is-playing');
    clips.pauseAll();
    cancelAnimationFrame(raf);
    playButton.textContent = t(locale, 'editor.play');
}

/** The timeline: one block per shot, sized by its length, and a playhead. Clicking a block seeks to it. */
function drawTimeline() {
    timeline.replaceChildren();
    if (!plan) return;
    for (const shot of plan.shots) {
        const block = document.createElement('button');
        block.type = 'button';
        block.className = `clip clip--${shot.shot}`;
        block.style.flexGrow = String(shot.seconds);
        block.style.flexBasis = '0';
        block.dataset.start = String(shot.start);
        const still = poster(root, shot.clip);
        if (still) block.style.backgroundImage = `url("${still}")`;
        block.title = `${name(locale, 'clip', shot.clip)} · ${shot.seconds.toFixed(1)}s`;
        const label = document.createElement('span');
        label.className = 'clip__name';
        label.textContent = name(locale, 'clip', shot.clip);
        const time = document.createElement('span');
        time.className = 'clip__time';
        time.textContent = `${shot.seconds.toFixed(1)}s`;
        block.append(label, time);
        block.addEventListener('click', () => {
            at = shot.start + 0.001;
            paint();
        });
        timeline.append(block);
    }
    const playhead = document.createElement('div');
    playhead.id = 'playhead';
    playhead.className = 'playhead';
    timeline.append(playhead);
    movePlayhead();
}

function movePlayhead() {
    const head = document.getElementById('playhead');
    if (!head || !plan?.seconds) return;
    head.style.left = `${(at / plan.seconds) * 100}%`;
    const now = plan.shots.findIndex(s => at >= s.start && at < s.end);
    for (const [i, row] of [...edl.tBodies[0]?.rows ?? []].entries()) row.classList.toggle('is-now', i === now);
}

/** Seconds as a timecode at 24 frames: HH:MM:SS:FF, the edit decision list's own clock. */
function timecode(seconds) {
    const frames = Math.round(seconds * 24);
    const f = frames % 24;
    const s = Math.floor(frames / 24);
    const pad = n => String(n).padStart(2, '0');
    return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(f)}`;
}

/** The cut as an edit decision list: event, clip, source in, record in, record out. */
function showEdl() {
    edl.replaceChildren();
    const head = edl.createTHead().insertRow();
    for (const label of ['#', t(locale, 'edl.clip'), t(locale, 'edl.src'), t(locale, 'edl.in'), t(locale, 'edl.out')]) {
        const th = document.createElement('th');
        th.scope = 'col';
        th.textContent = label;
        head.append(th);
    }
    const body = edl.createTBody();
    plan.shots.forEach((shot, i) => {
        const row = body.insertRow();
        for (const text of [String(i + 1).padStart(3, '0'), name(locale, 'clip', shot.clip), timecode(shot.sourceIn), timecode(shot.start), timecode(shot.end)]) {
            row.insertCell().textContent = text;
        }
    });
}

/** The screen takes the cut's frame; the title card names it. */
function showFrame() {
    screen.dataset.frame = plan.frame;
    screen.style.setProperty('--aspect', String(plan.aspect));
    $('frame-name').textContent = FRAME_NAMES[plan.frame] ?? plan.frame;
}

function showWhy() {
    whyList.replaceChildren();
    for (const reason of plan.reasons) {
        const line = reasonSentence(locale, reason);
        if (!line) continue;
        const li = document.createElement('li');
        li.textContent = line;
        whyList.append(li);
    }
    if (!whyList.children.length) {
        const li = document.createElement('li');
        li.textContent = t(locale, 'cut.empty');
        whyList.append(li);
    }
}

function cutNow() {
    const text = input.value.trim();
    if (!text) {
        summary.textContent = t(locale, 'cut.empty');
        return;
    }
    pause();
    const next = cut(text, { locale });
    clips.want(next.shots.map(s => s.clip));
    const apply = () => {
        plan = next;
        at = 0;
        summary.textContent = `${t(locale, 'editor.total', { n: plan.seconds.toFixed(0) })} · ${t(locale, 'editor.shot', { n: plan.shots.length })} · ${FRAME_NAMES[plan.frame]}`;
        showFrame();
        drawTimeline();
        showWhy();
        showEdl();
        paint();
    };
    // A recut is a state change the eye should follow: the screen morphs to its new frame and the strip re-lays.
    if (plan && document.startViewTransition && !reduced.matches) document.startViewTransition(apply);
    else apply();
    plan = next;
    return plan;
}

function downloadCut() {
    if (!plan) return;
    const blob = new Blob([JSON.stringify(toFile(plan), null, 2) + '\n'], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vibecut.cut.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Render the cut to a video file. The canvas is recorded as it plays, so a 20 second cut takes 20 seconds; the
 * button says so and counts down. MediaRecorder may be absent (Firefox in some builds): the button says why instead.
 */
async function exportVideo() {
    if (!plan) return;
    if (typeof MediaRecorder === 'undefined' || !canvas.captureStream) {
        summary.textContent = t(locale, 'editor.exportNote');
        return;
    }
    const button = $('export');
    const wasAt = at;
    const mime = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find(m => MediaRecorder.isTypeSupported?.(m)) ?? 'video/webm';
    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 4_000_000 });
    const chunks = [];
    recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
    const done = new Promise(resolve => { recorder.onstop = resolve; });
    button.disabled = true;
    button.classList.add('is-recording');
    button.textContent = t(locale, 'editor.exporting');
    at = 0;
    paint();
    recorder.start(200);
    play();
    await new Promise(resolve => {
        const tick = () => (at >= plan.seconds && !playing ? resolve() : setTimeout(tick, 100));
        tick();
    });
    pause();
    await new Promise(r => setTimeout(r, 250));
    recorder.stop();
    await done;
    const blob = new Blob(chunks, { type: mime });
    // What was rendered, for the browser check (and for anyone reading the page in a console).
    window.vibecut.rendered = { bytes: blob.size, type: blob.type };
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vibecut-cut.webm';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    at = Math.min(wasAt, plan.seconds);
    button.disabled = false;
    button.classList.remove('is-recording');
    button.textContent = t(locale, 'editor.export');
    paint();
}

form?.addEventListener('submit', event => {
    event.preventDefault();
    cutNow();
});

playButton?.addEventListener('click', () => (playing ? pause() : play()));
$('download')?.addEventListener('click', downloadCut);
$('export')?.addEventListener('click', exportVideo);

for (const preset of document.querySelectorAll('[data-preset]')) {
    preset.addEventListener('click', () => {
        input.value = preset.dataset.preset;
        cutNow();
    });
}

window.addEventListener('resize', () => { if (plan) paint(); });

// The page's first cut, so the screen opens on a cut rather than an empty frame; the canvas's fonts repaint it.
cutNow();
document.fonts?.ready.then(() => { if (!playing) paint(); });
if (!plan) input.value = '';

// Kept for the browser check: the cut the page holds, and the shot it is on.
window.vibecut = { rendered: null, get plan() { return plan; }, get at() { return at; }, shotAt, cutNow, play, pause };
