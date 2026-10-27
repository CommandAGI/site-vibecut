// The A/文 button: the same glyph and the same list of a page's languages as CommandAGI's public sites.
// No inline script, so the site's policy keeps `script-src 'self'`.
const button = document.querySelector('.lang-btn');
const dialog = document.getElementById('lang');
if (button && dialog) {
  button.addEventListener('click', () => {
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  });
  for (const closer of dialog.querySelectorAll('[data-close]')) {
    closer.addEventListener('click', () => (dialog.open ? dialog.close() : dialog.removeAttribute('open')));
  }
  // The language the visitor is on is marked in the list, and the page keeps its own link current.
  const here = document.documentElement.lang;
  for (const link of dialog.querySelectorAll('a[hreflang]')) {
    const matches = link.getAttribute('hreflang') === here;
    link.toggleAttribute('aria-current', matches);
    if (matches) link.setAttribute('aria-current', 'true');
  }
}

// A visitor whose browser prefers another of the site's languages over this page's is offered it, as our public
// sites do. Only a language the site has, and not the one on screen.
const hint = document.getElementById('lang-hint');
if (hint) {
  const here = document.documentElement.lang;
  const site = [['en', '/', 'English'], ['es', '/es/', 'Español'], ['zh-Hans', '/zh/', '简体中文']];
  const base = tag => (String(tag).toLowerCase().startsWith('zh') ? 'zh-Hans' : String(tag).split('-')[0].toLowerCase());
  const first = (navigator.languages ?? [navigator.language]).map(base).find(b => site.some(([lang]) => lang === b));
  const offer = first && first !== here ? site.find(([lang]) => lang === first) : null;
  if (offer) {
    const link = hint.querySelector('a');
    link.href = offer[1];
    link.hreflang = offer[0];
    link.lang = offer[0];
    link.textContent = offer[2];
    hint.hidden = false;
  }
}
