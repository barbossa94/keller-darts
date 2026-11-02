// Hash router. Each screen exports render(view, param) and may return a cleanup function.
import * as db from './db.js';
import { setSound } from './fx.js';
import { t, getLang, setLang } from './i18n.js';
import * as home from './ui/home.js';
import * as players from './ui/players.js';
import * as profile from './ui/profile.js';
import * as setup from './ui/setup.js';
import * as play from './ui/play.js';
import * as board from './ui/board.js';
import * as settings from './ui/settings.js';

const routes = { '': home, players, player: profile, setup, play, board, settings };
const view = document.getElementById('view');
let cleanup = null;

// Static texts in index.html carry data-i18n with their English key.
function translateShell() {
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-lang]').forEach((b) => b.classList.toggle('on', b.dataset.lang === getLang()));
  document.title = t('Basement Darts');
}

async function route() {
  const [name, param] = location.hash.replace(/^#\/?/, '').split('/');
  const screen = routes[name] || home;
  if (cleanup) { try { cleanup(); } catch {} cleanup = null; }
  document.getElementById('overlay-root').innerHTML = '';
  document.body.classList.toggle('playing', screen === play);
  document.querySelectorAll('[data-nav]').forEach((a) => {
    a.classList.toggle('active', a.dataset.nav === (name || 'home') || (name === 'player' && a.dataset.nav === 'players'));
  });
  view.innerHTML = '';
  window.scrollTo(0, 0);
  cleanup = (await screen.render(view, param)) || null;
}

document.querySelectorAll('[data-lang]').forEach((b) => (b.onclick = () => {
  if (b.dataset.lang === getLang()) return;
  setLang(b.dataset.lang);
  translateShell();
  route();
}));

window.addEventListener('hashchange', route);
(async () => {
  translateShell();
  setSound((await db.settings()).sound);
  db.persist();
  route();
})();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
