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

// A visitor whose browser prefers another of this page's languages is offered it, as our public sites do.
const hint = document.getElementById('lang-hint');
if (hint) {
  const here = document.documentElement.lang;
  const prefers = navigator.languages ?? [navigator.language];
  const match = prefers.map(tag => String(tag)).find(tag => {
    if (tag === here) return false;
    if (tag.startsWith('zh')) return here === 'zh-Hans';
    return tag.split('-')[0] === here.split('-')[0];
  });
  if (match) {
    const other = hint.querySelector('a');
    if (other) {
      other.href = document.body.dataset.other;
      other.textContent = document.body.dataset.otherName;
      hint.hidden = false;
    }
  }
}
