// The reel at the foot of the page: the page's timecode advances with the scroll (24 frames a second, one second of
// timecode per screen's height of scroll), the reel the visitor is in is marked, and each looping clip plays only
// while it is on screen. A visitor who asks for reduced motion gets the posters: no clip plays by itself.
const reel = document.querySelector('.reel');
const tc = document.getElementById('scroll-tc');
const links = [...document.querySelectorAll('.reel__track a')];
const sections = links.map(a => document.querySelector(a.getAttribute('href')));
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const pad = n => String(n).padStart(2, '0');

let queued = false;
function update() {
    queued = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(1, scrollY / max) : 0;
    reel?.style.setProperty('--p', p.toFixed(4));
    const frames = Math.round((scrollY / innerHeight) * 24 * 4);
    if (tc) tc.textContent = `00:${pad(Math.floor(frames / 1440) % 60)}:${pad(Math.floor(frames / 24) % 60)}:${pad(frames % 24)}`;
    let current = 0;
    sections.forEach((section, i) => { if (section && section.getBoundingClientRect().top < innerHeight * 0.45) current = i; });
    links.forEach((a, i) => (i === current ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
}
addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
addEventListener('resize', update);
update();

const loops = document.querySelectorAll('video.loop');
const watcher = new IntersectionObserver(entries => {
    for (const { target, isIntersecting } of entries) {
        if (isIntersecting && !reduced.matches) {
            if (target.preload !== 'auto') { target.preload = 'auto'; target.load(); }
            target.play().catch(() => {});
        } else target.pause();
    }
}, { rootMargin: '120px 0px' });
for (const video of loops) watcher.observe(video);
reduced.addEventListener?.('change', () => { if (reduced.matches) for (const v of loops) v.pause(); });
