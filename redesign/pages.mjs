// The three pages from one template: index.html, es/index.html and zh/index.html. Run it after changing a page's
// words or structure (node redesign/pages.mjs); the pages it writes are the site, plain HTML with no build.
import { writeFile, mkdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = resolve(fileURLToPath(new URL('..', import.meta.url)));
const ORIGIN = 'https://vibecut.commandagi.app';

const W = {
    en: {
        lang: 'en', locale: 'en', dir: '', root: '',
        title: 'VibeCut: cut video by description',
        description: 'VibeCut is a browser-native video editor. Describe the cut — the length, the shots, the pace, what to leave out — and it builds the edit and plays it. Nothing is uploaded.',
        skip: 'Skip to the content', language: 'Language', close: 'Close', site: 'Site', home: 'VibeCut, home',
        slate: ['Reel 1', 'Sc. 01', 'Tk. 03'],
        h1: 'Describe the cut. Watch it play.',
        lede: 'Say how long, which shots, how fast, what to leave out. VibeCut cuts it and plays it here.',
        fine: 'Free in beta. No sign-in, no upload: the footage and the cut engine are in this page.',
        generated: 'Sample footage generated for this page. No real studio, person or event.',
        label: 'Describe the cut',
        value: 'A 20 second cut, fast, wide shots of the robot arm, end with the logo, no coffee',
        cut: 'Cut it', takes: 'Takes',
        presets: [
            ['A quiet 30 second film of the studio at dawn, slow, no city', 'A quiet film'],
            ['15 seconds of close-ups, the hands and the lens, slow motion, vertical', 'Close-ups, vertical'],
            ['Un corte de 20 segundos del brazo robot, rápido, sin café, cuadrado', 'Un corte (es)'],
            ['25 秒，全景，城市，快剪，不要咖啡', '空镜剪辑 (zh)'],
        ],
        play: 'Play', download: 'Download the cut', export: 'Render a video',
        timeline: 'Timeline', why: 'Why this cut', edl: 'Edit decision list', frame: 'Frame',
        save: 'The cut is a plain JSON file. A render records as it plays, in real time.',
        nav: ['The cut', 'How it decides', 'What you keep', 'Credits'],
        interstitial: 'Every cut has a reason.',
        interstitialSub: 'The engine reads your words, not your mind. Same words, same cut, every time.',
        howH: 'How it decides',
        how: [
            ['Describe it', 'Length, kinds of shot, pace, subjects, what to leave out, and the frame. English, Spanish or Chinese.', 'lens-hands'],
            ['It cuts', 'Your words meet the footage. The length you asked for, to the millisecond. It ends on the card unless you say no.', 'lathe-turn'],
            ['Keep it', 'Scrub the timeline, play it, download the cut as JSON, or render a video in the browser.', 'arm-stack'],
        ],
        whatH: 'What you keep',
        what: [
            ['A cut you can read', 'Shots, in and out points, speed and the reason for each. A file, not a black box.', 'dawn-studio'],
            ['Reasons in words', 'Why a shot is out, why it ends where it ends.', 'studio-wide'],
            ['In your browser', 'Engine, footage and playback run on the page. Nothing uploaded, nothing tracked.', 'coffee-steam'],
            ['Three languages', 'English, Spanish and Simplified Chinese, behind the A/文 button.', 'city-night'],
        ],
        creditsH: 'Credits',
        creditsSub: 'Free while it is in beta. We charge for the studio when the studio is worth charging for.',
        plans: [
            ['Beta', 'Free', 'This editor, the sample footage, the cut file and the rendered video.', 'Write to us', 'mailto:hello@vibecut.me'],
            ['Studio', 'Later', 'Your own footage, hour-long cuts, a library of your shots. Tell us what you need first.', 'Ask about it', 'mailto:hello@vibecut.me?subject=VibeCut%20Studio'],
        ],
        roll: [['Cut engine', 'lib/edl.mjs, in this page'], ['Footage', 'generated with fal (Kling 2.5)'], ['Type', 'Big Shoulders, Hanken Grotesk, DM Mono'], ['A company of', 'CommandAGI']],
        fin: 'Fin.',
    },
    es: {
        lang: 'es', locale: 'es', dir: 'es/', root: '../',
        title: 'VibeCut: corta vídeo describiéndolo',
        description: 'VibeCut es un editor de vídeo en el navegador. Describe el corte —la duración, los planos, el ritmo, lo que quieres dejar fuera— y construye el montaje y lo reproduce. No se sube nada.',
        skip: 'Saltar al contenido', language: 'Idioma', close: 'Cerrar', site: 'Sitio', home: 'VibeCut, inicio',
        slate: ['Rollo 1', 'Esc. 01', 'Toma 03'],
        h1: 'Describe el corte. Míralo en pantalla.',
        lede: 'Di cuánto dura, qué planos, qué ritmo y qué dejar fuera. VibeCut lo corta y lo reproduce aquí.',
        fine: 'Gratis en beta. Sin registro y sin subidas: el material y el motor del corte están en esta página.',
        generated: 'Material de ejemplo generado para esta página. Ningún estudio, persona ni hecho real.',
        label: 'Describe el corte',
        value: 'Un corte de 20 segundos, rápido, planos generales del brazo robot, terminar con el logo, sin café',
        cut: 'Cortar', takes: 'Tomas',
        presets: [
            ['Una película tranquila de 30 segundos del estudio al amanecer, lento, sin ciudad', 'Una película tranquila'],
            ['15 segundos de primeros planos, las manos y el objetivo, cámara lenta, vertical', 'Primeros planos, vertical'],
            ['A 20 second cut of the robot arm, fast, no coffee, square', 'A cut (en)'],
            ['25 秒，全景，城市，快剪，不要咖啡', '空镜剪辑 (zh)'],
        ],
        play: 'Reproducir', download: 'Descargar el corte', export: 'Generar un vídeo',
        timeline: 'Línea de tiempo', why: 'Por qué este corte', edl: 'Lista de decisiones', frame: 'Encuadre',
        save: 'El corte es un archivo JSON legible. El vídeo se graba mientras se reproduce, en tiempo real.',
        nav: ['El corte', 'Cómo decide', 'Qué te llevas', 'Créditos'],
        interstitial: 'Cada corte tiene una razón.',
        interstitialSub: 'El motor lee tus palabras, no tu mente. Mismas palabras, mismo corte, siempre.',
        howH: 'Cómo decide',
        how: [
            ['Descríbelo', 'Duración, tipos de plano, ritmo, sujetos, lo que dejar fuera y el encuadre. En inglés, español o chino.', 'lens-hands'],
            ['Se corta', 'Tus palabras se unen al material. La duración que pediste, al milisegundo. Termina con el cierre, salvo que digas que no.', 'lathe-turn'],
            ['Guárdalo', 'Recorre la línea de tiempo, reprodúcelo, descarga el corte como JSON o genera un vídeo en el navegador.', 'arm-stack'],
        ],
        whatH: 'Qué te llevas',
        what: [
            ['Un corte legible', 'Planos, entradas y salidas, velocidad y la razón de cada uno. Un archivo, no una caja negra.', 'dawn-studio'],
            ['Razones en palabras', 'Por qué un plano queda fuera, por qué termina donde termina.', 'studio-wide'],
            ['En tu navegador', 'Motor, material y reproducción corren en la página. No se sube ni se rastrea nada.', 'coffee-steam'],
            ['Tres idiomas', 'Inglés, español y chino simplificado, tras el botón A/文.', 'city-night'],
        ],
        creditsH: 'Créditos',
        creditsSub: 'Gratis mientras está en beta. Cobraremos por el estudio cuando el estudio valga la pena.',
        plans: [
            ['Beta', 'Gratis', 'Este editor, el material de ejemplo, el archivo del corte y el vídeo generado.', 'Escríbenos', 'mailto:hello@vibecut.me'],
            ['Estudio', 'Más adelante', 'Tu propio material, cortes de una hora, una biblioteca de tus planos. Cuéntanos primero qué necesitas.', 'Preguntar', 'mailto:hello@vibecut.me?subject=VibeCut%20Studio'],
        ],
        roll: [['Motor del corte', 'lib/edl.mjs, en esta página'], ['Material', 'generado con fal (Kling 2.5)'], ['Tipografía', 'Big Shoulders, Hanken Grotesk, DM Mono'], ['Una compañía de', 'CommandAGI']],
        fin: 'Fin.',
    },
    zh: {
        lang: 'zh-Hans', locale: 'zh-Hans', dir: 'zh/', root: '../',
        title: 'VibeCut：说一句，剪出来',
        description: 'VibeCut 是一个在浏览器里运行的视频剪辑器。说出时长、镜头、节奏和要舍弃的内容，它就生成剪辑并播放。不上传任何东西。',
        skip: '跳到正文', language: '语言', close: '关闭', site: '站点', home: 'VibeCut 首页',
        slate: ['第 1 卷', '场 01', '条 03'],
        h1: '说一句，剪出来。',
        lede: '说时长、要哪些镜头、节奏多快、舍弃什么。VibeCut 就在这里剪好并播放。',
        fine: '内测期间免费。无需登录，无需上传：素材和剪辑引擎都在这个页面里。',
        generated: '示例素材为本页生成，并非真实的工作室、人物或事件。',
        label: '描述你要的剪辑',
        value: '20 秒，快剪，机械臂的全景，以标志结尾，不要咖啡',
        cut: '开始剪辑', takes: '示例',
        presets: [
            ['30 秒，慢，清晨的工作室，不要城市', '一段安静的片子'],
            ['15 秒特写，手和镜头，慢动作，竖屏', '特写，竖屏'],
            ['A quiet 30 second film of the studio at dawn, slow', 'A film (en)'],
            ['Un corte de 20 segundos del brazo robot, rápido, sin café', 'Un corte (es)'],
        ],
        play: '播放', download: '下载剪辑单', export: '导出视频',
        timeline: '时间线', why: '为什么这样剪', edl: '剪辑决定表', frame: '画幅',
        save: '剪辑是一个纯 JSON 文件。导出视频时边播边录，实时进行。',
        nav: ['剪辑', '如何决定', '你得到什么', '演职员表'],
        interstitial: '每一刀都有理由。',
        interstitialSub: '引擎读的是你的话，不是你的心思。同样的话，永远剪出同样的片子。',
        howH: '如何决定',
        how: [
            ['描述', '时长、镜头类型、节奏、对象、要舍弃的内容，以及画幅。支持英文、西班牙文和中文。', 'lens-hands'],
            ['剪辑', '你的话和素材对上。时长精确到毫秒。以片尾收尾，除非你说不要。', 'lathe-turn'],
            ['保存', '拖动时间线、播放、把剪辑下载成 JSON，或在浏览器里导出视频。', 'arm-stack'],
        ],
        whatH: '你得到什么',
        what: [
            ['看得懂的剪辑', '镜头、入点出点、速度，以及每一个选择的理由。是文件，不是黑箱。', 'dawn-studio'],
            ['用文字说理由', '为什么舍弃某个镜头，为什么在这里结束。', 'studio-wide'],
            ['在你的浏览器里', '引擎、素材和播放都在页面上运行。不上传，不追踪。', 'coffee-steam'],
            ['三种语言', '英文、西班牙文和简体中文，点 A/文 切换。', 'city-night'],
        ],
        creditsH: '演职员表',
        creditsSub: '内测期间免费。等到工作室版值得收费时，我们再收。',
        plans: [
            ['内测', '免费', '本页的编辑器、示例素材、剪辑文件和导出的视频。', '写信给我们', 'mailto:hello@vibecut.me'],
            ['工作室版', '以后', '你自己的素材、一小时的剪辑、常用镜头库。先告诉我们你需要什么。', '了解一下', 'mailto:hello@vibecut.me?subject=VibeCut%20Studio'],
        ],
        roll: [['剪辑引擎', 'lib/edl.mjs，就在本页'], ['素材', '用 fal 生成（Kling 2.5）'], ['字体', 'Big Shoulders、Hanken Grotesk、DM Mono'], ['出品', 'CommandAGI']],
        fin: '完。',
    },
};

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** A looping clip that plays only while it is on screen (app/reels.mjs), behind its poster. */
const clip = (r, name, cls = '') => `<video class="loop ${cls}" muted loop playsinline preload="none" poster="${r}media/${name}.webp" aria-hidden="true" tabindex="-1">
        <source src="${r}media/${name}.webm" type='video/webm; codecs="av01.0.05M.08"'>
        <source src="${r}media/${name}.mp4" type="video/mp4">
      </video>`;

function page(w) {
    const r = w.root;
    const tc = i => `00:0${i}:00:00`;
    return `<!doctype html>
<html lang="${w.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'">
<title>${esc(w.title)}</title>
<meta name="description" content="${esc(w.description)}">
<meta name="theme-color" content="#101010">
<meta property="og:title" content="${esc(w.title)}">
<meta property="og:description" content="${esc(w.description)}">
<meta property="og:image" content="${ORIGIN}/og.png">
<meta property="og:url" content="${ORIGIN}/${w.dir}">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="${ORIGIN}/${w.dir}">
<link rel="alternate" hreflang="en" href="${ORIGIN}/">
<link rel="alternate" hreflang="es" href="${ORIGIN}/es/">
<link rel="alternate" hreflang="zh-Hans" href="${ORIGIN}/zh/">
<link rel="alternate" hreflang="x-default" href="${ORIGIN}/">
<link rel="preload" href="${r}fonts/big-shoulders-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${r}fonts/hanken-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${r}style.css">
<link rel="icon" href="${r}mark.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${r}touch-icon.png">
</head>
<body data-locale="${w.locale}" data-root="${r}">
<a class="skip" href="#main">${esc(w.skip)}</a>

<header class="slate">
  <a class="brand" href="${r || './'}" aria-label="${esc(w.home)}"><img src="${r}wordmark.svg" alt="VibeCut" width="114" height="32"></a>
  <p class="slate__meta" aria-hidden="true">${w.slate.map(s => `<span>${esc(s)}</span>`).join('')}</p>
  <button class="lang-btn" type="button" aria-haspopup="dialog" aria-label="${esc(w.language)}">
    <span class="lang-btn__glyph" aria-hidden="true">A<span>/</span><span lang="zh-Hans">文</span></span>
  </button>
</header>

<dialog id="lang" aria-label="${esc(w.language)}">
  <h2>${esc(w.language)}</h2>
  <ul>
    <li><a href="/" hreflang="en" lang="en">English</a></li>
    <li><a href="/es/" hreflang="es" lang="es">Español</a></li>
    <li><a href="/zh/" hreflang="zh-Hans" lang="zh-Hans">简体中文</a></li>
  </ul>
  <button class="key" type="button" data-close>${esc(w.close)}</button>
</dialog>

<main id="main">
  <section class="screening" id="cut" aria-labelledby="title">
    <div class="screen-well">
      <div class="screen" id="screen">
        <canvas id="preview" width="1280" height="536" aria-label="${esc(w.h1)}"></canvas>
        <p class="frame-tag" aria-hidden="true"><span id="frame-name">2.39:1</span></p>
      </div>
      <div class="title-card">
        <h1 id="title">${esc(w.h1)}</h1>
        <p class="lede">${esc(w.lede)}</p>
      </div>
    </div>

    <div class="deck">
      <div class="transport">
        <button class="key key--play" type="button" id="play">${esc(w.play)}</button>
        <output class="clock" id="clock" aria-live="off">00:00.0 / 00:20</output>
        <button class="key" type="button" id="download">${esc(w.download)}</button>
        <button class="key" type="button" id="export">${esc(w.export)}</button>
      </div>

      <div class="timeline-shell">
        <p class="rule-label" id="timeline-label">${esc(w.timeline)}</p>
        <div class="timeline" id="timeline" role="group" aria-labelledby="timeline-label"></div>
      </div>

      <form class="cmd" id="cut-form">
        <label for="description">${esc(w.label)}</label>
        <div class="cmd__row">
          <textarea id="description" name="description" rows="2">${esc(w.value)}</textarea>
          <button class="key key--cut" type="submit">${esc(w.cut)}</button>
        </div>
        <div class="takes" role="group" aria-label="${esc(w.takes)}">
          ${w.presets.map(([text, label], i) => `<button type="button" data-preset="${esc(text)}"><span aria-hidden="true">TK ${i + 1}</span> ${esc(label)}</button>`).join('\n          ')}
        </div>
      </form>

      <p class="summary" id="summary" role="status"></p>

      <div class="notes">
        <div class="why">
          <h2>${esc(w.why)}</h2>
          <ul id="why"></ul>
        </div>
        <div class="edl-wrap">
          <h2>${esc(w.edl)}</h2>
          <table class="edl" id="edl"></table>
          <p class="save-note">${esc(w.save)}</p>
        </div>
      </div>

      <p class="fine">${esc(w.fine)} <span class="disclose">${esc(w.generated)}</span></p>
      <p id="lang-hint" hidden><a href="/"></a></p>
    </div>
  </section>

  <section class="interstitial" aria-labelledby="reason">
    <div class="interstitial__picture">${clip(r, 'city-night')}</div>
    <div class="interstitial__words">
      <h2 id="reason">${esc(w.interstitial)}</h2>
      <p>${esc(w.interstitialSub)}</p>
    </div>
  </section>

  <section class="plates" id="how" aria-labelledby="how-h">
    <h2 class="section-title" id="how-h"><span class="tc" aria-hidden="true">${tc(1)}</span>${esc(w.howH)}</h2>
    <ol>
      ${w.how.map(([h, p, media], i) => `<li class="plate">
        <div class="plate__picture">${clip(r, media)}</div>
        <div class="plate__words">
          <p class="plate__num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</p>
          <h3>${esc(h)}</h3>
          <p>${esc(p)}</p>
        </div>
      </li>`).join('\n      ')}
    </ol>
  </section>

  <section class="contact" id="what" aria-labelledby="what-h">
    <h2 class="section-title" id="what-h"><span class="tc" aria-hidden="true">${tc(2)}</span>${esc(w.whatH)}</h2>
    <ul class="strip">
      ${w.what.map(([h, p, media], i) => `<li class="frame">
        <img src="${r}media/${media}.webp" alt="" width="960" height="540" loading="lazy" decoding="async">
        <p class="frame__no" aria-hidden="true">${String(i + 1).padStart(2, '0')}A</p>
        <h3>${esc(h)}</h3>
        <p>${esc(p)}</p>
      </li>`).join('\n      ')}
    </ul>
  </section>

  <section class="credits" id="pricing" aria-labelledby="credits-h">
    <h2 class="section-title" id="credits-h"><span class="tc" aria-hidden="true">${tc(3)}</span>${esc(w.creditsH)}</h2>
    <p class="credits__sub">${esc(w.creditsSub)}</p>
    <div class="billing">
      ${w.plans.map(([h, price, p, cta, href], i) => `<div class="bill">
        <h3>${esc(h)}</h3>
        <p class="bill__price">${esc(price)}</p>
        <p>${esc(p)}</p>
        <a class="key${i === 0 ? ' key--cut' : ''}" href="${esc(href)}">${esc(cta)}</a>
      </div>`).join('\n      ')}
    </div>
  </section>
</main>

<footer class="roll">
  <dl>
    ${w.roll.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('\n    ')}
    <div><dt>${esc(w.nav[3])}</dt><dd><a href="mailto:hello@vibecut.me">hello@vibecut.me</a></dd></div>
  </dl>
  <p class="disclose">${esc(w.generated)}</p>
  <p class="fin">${esc(w.fin)}</p>
</footer>

<nav class="reel" aria-label="${esc(w.site)}">
  <ol class="reel__track">
    ${['#cut', '#how', '#what', '#pricing'].map((href, i) => `<li><a href="${href}"><span class="reel__no" aria-hidden="true">R${i + 1}</span> <span class="reel__label">${esc(w.nav[i])}</span></a></li>`).join('\n    ')}
  </ol>
  <span class="reel__head" aria-hidden="true"></span>
  <span class="reel__tc" id="scroll-tc" aria-hidden="true">00:00:00:00</span>
</nav>

<script type="module" src="${r}app/lang.mjs"></script>
<script type="module" src="${r}app/reels.mjs"></script>
<script type="module" src="${r}app/app.mjs"></script>
</body>
</html>
`;
}

for (const w of Object.values(W)) {
    await mkdir(join(SITE, w.dir), { recursive: true });
    await writeFile(join(SITE, w.dir, 'index.html'), page(w));
}
console.log('wrote index.html, es/index.html, zh/index.html');
