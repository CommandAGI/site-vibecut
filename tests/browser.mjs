// The page, in a real browser: the highest test that catches a broken demo.
//
// It serves this folder (or visits a live address), drives Chromium over its DevTools protocol, and holds the page to
// what a visitor does from a blank visit: it loads with no page error, draws a frame, cuts the description it was
// given, builds a timeline, plays, and says why. The three languages are checked the same way.
//
//   node tests/browser.mjs                 the folder, served here
//   node tests/browser.mjs https://vibecut.commandagi.app   the live site
//
// Needs Chromium (CHROMIUM=/path/to/chromium to choose) and Node 22+ for its own WebSocket. No npm package.
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdtemp, readdir, stat } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

function serveFolder(folder) {
    const server = createServer(async (req, res) => {
        try {
            const url = new URL(req.url, 'http://x');
            let file = join(folder, decodeURIComponent(url.pathname));
            if (!file.startsWith(folder)) { res.writeHead(403).end(); return; }
            if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
            if (!existsSync(file)) { res.writeHead(404).end('not found'); return; }
            const body = await readFile(file);
            res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
            res.end(body);
        } catch (e) {
            res.writeHead(500).end(String(e));
        }
    });
    return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port })));
}

function chromiumPath() {
    for (const p of [process.env.CHROMIUM, '/usr/bin/chromium-browser', '/usr/bin/chromium', '/snap/bin/chromium', '/usr/bin/google-chrome'].filter(Boolean)) {
        if (existsSync(p)) return p;
    }
    throw new Error('no Chromium found: set CHROMIUM=/path/to/chromium');
}

async function launch() {
    const profile = await mkdtemp(join(tmpdir(), 'vibecut-browser-'));
    const port = 9222 + Math.floor(Math.random() * 500);
    const child = spawn(chromiumPath(), [
        '--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--mute-audio',
        '--disable-dev-shm-usage', `--window-size=1280,${process.env.WIN_H ?? 1000}`,
        `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank',
    ], { stdio: 'ignore' });
    for (let i = 0; i < 100; i += 1) {
        try {
            const res = await fetch(`http://127.0.0.1:${port}/json/version`);
            if (res.ok) {
                const version = await res.json();
                const ws = new WebSocket(version.webSocketDebuggerUrl);
                await new Promise((open, fail) => { ws.onopen = open; ws.onerror = fail; });
                let id = 0;
                const pending = new Map();
                const listeners = [];
                ws.onmessage = event => {
                    const message = JSON.parse(event.data);
                    if (message.id && pending.has(message.id)) { pending.get(message.id)(message); pending.delete(message.id); }
                    else listeners.forEach(fn => fn(message));
                };
                const send = (method, params = {}) => new Promise(resolve => {
                    const messageId = ++id;
                    pending.set(messageId, resolve);
                    ws.send(JSON.stringify({ id: messageId, method, params }));
                });
                return { child, port, profile, version, send, on: fn => listeners.push(fn) };
            }
        } catch { /* still starting */ }
        await sleep(100);
    }
    child.kill('SIGKILL');
    throw new Error('Chromium did not open its debugging port');
}

/** A page target and the messages on its channel. */
async function openPage(port, url) {
    const created = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' });
    const target = await created.json();
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    let id = 0;
    const pending = new Map();
    const errors = [];
    const injected = [];
    const failed = [];
    ws.onmessage = event => {
        const message = JSON.parse(event.data);
        if (message.id && pending.has(message.id)) {
            pending.get(message.id)(message);
            pending.delete(message.id);
            return;
        }
        if (message.method === 'Runtime.exceptionThrown') {
            errors.push(message.params.exceptionDetails?.exception?.description ?? message.params.exceptionDetails?.text);
        }
        if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
            errors.push(message.params.args.map(a => a.value ?? a.description ?? a.type).join(' '));
        }
        if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') {
            const entry = message.params.entry;
            // A 404 for a page we did not ask for is still a missing file the site names.
            const line = `${entry.text}${entry.url ? ` (${entry.url})` : ''}`;
            // The host injects Cloudflare's analytics beacon into every site it serves; this site's own policy blocks
            // it. That is the platform's script, not the page's, so it is reported apart and never let pass in silence.
            (Cloudflare.beacon(line) ? injected : errors).push(line);
        }
        if (message.method === 'Network.loadingFailed') failed.push(message.params);
    };
    const send = (method, params = {}) => new Promise(resolve => {
        const messageId = ++id;
        pending.set(messageId, resolve);
        ws.send(JSON.stringify({ id: messageId, method, params }));
    });
    await send('Runtime.enable');
    await send('Log.enable');
    await send('Page.enable');
    const evaluate = async (expression, { awaitPromise = false, userGesture = false } = {}) => {
        const answer = await send('Runtime.evaluate', { expression, awaitPromise, userGesture, returnByValue: true });
        if (answer.result?.exceptionDetails) throw new Error(answer.result.exceptionDetails.exception?.description ?? answer.result.exceptionDetails.text);
        return answer.result?.result?.value;
    };
    const goto = async next => {
        const loaded = new Promise(resolve => {
            const onMessage = event => {
                const message = JSON.parse(event.data);
                if (message.method === 'Page.loadEventFired') { ws.removeEventListener('message', onMessage); resolve(); }
            };
            ws.addEventListener('message', onMessage);
        });
        await send('Page.navigate', { url: next });
        await Promise.race([loaded, sleep(15000)]);
        await sleep(400);
    };
    return { ws, errors, injected, failed, send, evaluate, goto, close: () => ws.close() };
}

function assert(ok, message) {
    if (!ok) throw new Error(`FAIL ${message}`);
    console.log(`ok   ${message}`);
}

/** The host's own injected script: Cloudflare Web Analytics, which this site's policy blocks. */
const Cloudflare = {
    beacon: line => /cloudflareinsights\.com/.test(line),
};

/** The checks a visitor makes on one page. */
async function checkPage(browser, url, label, { heading, playLabel, export: doExport = false }) {
    console.log(`\n== ${label}: ${url}`);
    const page = await openPage(browser.port, url);
    try {
        await page.goto(url);
        const title = await page.evaluate('document.title');
        assert(!!title, `${label}: the page has a title (${title})`);

        const h1 = await page.evaluate('document.querySelector("h1")?.textContent?.trim()');
        assert(h1 === heading, `${label}: the headline is in this language (${h1})`);

        // The first cut plays on load: the page draws its own footage.
        const plan = await page.evaluate('window.vibecut?.plan ?? null');
        assert(plan && plan.shots.length > 0, `${label}: the page cuts its first description on load (${plan?.shots.length} shots, ${plan?.seconds}s)`);
        const lit = await page.evaluate(`(() => {
            const c = document.getElementById('preview');
            const ctx = c.getContext('2d');
            const d = ctx.getImageData(0, 0, c.width, c.height).data;
            let nonBlack = 0;
            for (let i = 0; i < d.length; i += 4) if (d[i] + d[i+1] + d[i+2] > 24) nonBlack += 1;
            return { nonBlack, total: d.length / 4 };
        })()`);
        assert(lit.nonBlack > lit.total * 0.05, `${label}: the preview draws a frame (${lit.nonBlack}/${lit.total} lit pixels)`);

        const blocks = await page.evaluate('document.querySelectorAll("#timeline .clip").length');
        assert(blocks === plan.shots.length, `${label}: the timeline has a block per shot (${blocks})`);
        const why = await page.evaluate('document.querySelectorAll("#why li").length');
        assert(why > 0, `${label}: the page says why (${why} reasons)`);

        // The main flow: a visitor types a description and presses the button.
        const description = label === 'es' ? 'Un corte de 12 segundos, rápido, el brazo robot, sin café'
            : label === 'zh' ? '12 秒，快剪，机械臂，不要咖啡'
                : 'A 12 second cut, fast, the robot arm, no coffee';
        await page.evaluate(`(() => {
            const input = document.getElementById('description');
            input.value = ${JSON.stringify(description)};
            document.getElementById('cut-form').requestSubmit();
        })()`);
        await sleep(400);
        const second = await page.evaluate('JSON.parse(JSON.stringify(window.vibecut.plan))');
        assert(Math.abs(second.seconds - 12) < 0.01, `${label}: a typed description cuts 12 seconds (${second.seconds})`);
        assert(!second.shots.some(s => s.clip === 'coffee-steam'), `${label}: "no coffee" keeps the coffee shot out`);
        assert(second.shots.at(-1).shot === 'logo', `${label}: the cut ends on the end card`);

        // Play: the clock moves.
        await page.evaluate('document.getElementById("play").click()');
        await sleep(1200);
        const at = await page.evaluate('window.vibecut.at');
        assert(at > 0.4, `${label}: play moves the cut (${at?.toFixed(2)}s)`);
        const label0 = await page.evaluate('document.getElementById("play").textContent');
        assert(label0 === playLabel.replace('Play', 'Pause').replace('Reproducir', 'Pausar').replace('播放', '暂停'),
            `${label}: the play button flips in this language (${label0})`);
        await page.evaluate('document.getElementById("play").click()');

        // A preset cuts too.
        await page.evaluate('document.querySelector("[data-preset]").click()');
        await sleep(300);
        const preset = await page.evaluate('JSON.parse(JSON.stringify(window.vibecut.plan))');
        assert(preset.seconds > 0 && preset.shots.length > 0, `${label}: a preset cuts (${preset.seconds}s, ${preset.shots.length} shots)`);

        // The language picker lists the three languages.
        const languages = await page.evaluate('[...document.querySelectorAll("#lang a")].map(a => a.getAttribute("hreflang"))');
        assert(languages.join(',') === 'en,es,zh-Hans', `${label}: the A/文 list names the three languages (${languages.join(', ')})`);

        // Render a video: the browser records the canvas as it plays and the file arrives. A 4 second cut, so the
        // check takes about that long; the file must be a real WebM, not an empty download.
        if (doExport) {
            const downloads = await mkdtemp(join(tmpdir(), 'vibecut-download-'));
            const started = [];
            const states = [];
            browser.on(message => {
                if (message.method === 'Browser.downloadWillBegin') started.push(message.params.suggestedFilename);
                if (message.method === 'Browser.downloadProgress') states.push(message.params.state);
            });
            await browser.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: downloads, eventsEnabled: true });
            // A download needs a user gesture, so this click carries one, as a visitor's does.
            await page.evaluate(`(() => {
                const input = document.getElementById('description');
                input.value = 'A 4 second cut, close-ups';
                document.getElementById('cut-form').requestSubmit();
                document.getElementById('export').click();
            })()`, { userGesture: true });
            let file = null;
            for (let i = 0; i < 120 && !file; i += 1) {
                await sleep(250);
                for (const dir of [downloads, join(browser.profile, 'Downloads')]) {
                    const names = await readdir(dir).catch(() => []);
                    const done = names.find(n => n.endsWith('.webm'));
                    if (done && (await stat(join(dir, done))).size > 2000) file = join(dir, done);
                }
            }
            // The browser must have produced a real video and handed it to the download. Where this Chromium keeps
            // the file is its own business (a headless profile may not write it where it is asked), so the page's
            // answer — the blob it rendered — is what the check holds.
            const rendered = await page.evaluate('window.vibecut.rendered ? JSON.parse(JSON.stringify(window.vibecut.rendered)) : null');
            assert(rendered && rendered.bytes > 2000, `${label}: Render a video produces a WebM (${rendered ? `${Math.round(rendered.bytes / 1024)} KB ${rendered.type}` : 'nothing'})`);
            let ended = states;
            for (let i = 0; i < 40 && !ended.includes('completed'); i += 1) { await sleep(250); ended = states; }
            assert(started.length > 0 && ended.includes('completed'),
                `${label}: the video reaches a download (${started.join(', ') || 'none'}; ${ended.join(', ') || 'none'})`);
        }

        const shot = await page.send('Page.captureScreenshot', { format: 'png' });
        return { title, shot: shot.result?.data, errors: page.errors, injected: page.injected };
    } catch (error) {
        const errors = page.errors.length ? `\npage errors:\n${page.errors.join('\n')}` : '\n(no page error)';
        throw new Error(`${error.message}${errors}`);
    } finally {
        page.close();
    }
}

async function main() {
    const live = process.argv[2] && /^https?:/.test(process.argv[2]);
    let server = null;
    let base = process.argv[2];
    if (!live) {
        const started = await serveFolder(ROOT);
        server = started.server;
        base = `http://127.0.0.1:${started.port}`;
    }
    const browser = await launch();
    console.log(`chromium ${browser.version.Browser}`);
    const results = [];
    try {
        results.push(await checkPage(browser, `${base}/`, 'en', { heading: 'Describe the cut. Watch it play.', playLabel: 'Play', export: process.env.EXPORT !== '0' }));
        results.push(await checkPage(browser, `${base}/es/`, 'es', { heading: 'Describe el corte. Míralo sonar.', playLabel: 'Reproducir' }));
        results.push(await checkPage(browser, `${base}/zh/`, 'zh', { heading: '说一句，剪出来。', playLabel: '播放' }));
    } finally {
        browser.child.kill('SIGKILL');
        if (server) server.close();
    }
    // No page error on any of the three, and no request the site itself failed.
    const errors = results.flatMap(r => r.errors ?? []);
    if (errors.length) throw new Error(`page errors:\n${errors.join('\n')}`);
    const injected = results.flatMap(r => r.injected ?? []);
    if (injected.length) {
        console.log(`\nnote: ${injected.length} blocked script(s) the host injected, not the page's own (${injected[0].slice(0, 90)}…)`);
    }
    const out = process.env.SHOT_DIR;
    if (out) {
        await writeFile(join(out, live ? 'live-en.png' : 'local-en.png'), Buffer.from(results[0].shot, 'base64'));
    }
    console.log('\nall three languages pass, with no page error');
}

main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
});
