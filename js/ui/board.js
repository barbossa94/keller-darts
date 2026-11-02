import * as db from '../db.js';
import { compute, fmt1, byRanking, PRIOR_LEGS, ROOKIE_LEGS } from '../stats.js';
import { t } from '../i18n.js';
import { html, esc, avatar, $$ } from './common.js';

const COLS = [
  { key: 'games', label: 'Games' },
  { key: 'wins', label: 'Wins' },
  { key: 'winRate', label: 'Win %', fmt: (v) => `${Math.round(v * 100)}%` },
  { key: 'avg', label: '3-dart avg', fmt: fmt1 },
  { key: 'rating', label: 'Rating', fmt: fmt1, cls: 'rating' },
  { key: 'bestVisit', label: 'Max 3-dart' },
  { key: 'bestCheckout', label: 'Best out', fmt: (v) => v || '-' },
  { key: 'max', label: '180s' },
];

let sortKey = 'rating';
let range = 'all';

export async function render(view) {
  const [games, pm] = await Promise.all([db.finishedGames(), db.playerMap()]);

  const draw = () => {
    const since = range === 'year' ? new Date(new Date().getFullYear(), 0, 1).getTime() : 0;
    const { per, houseAvg, totalGames } = compute(games, { since });
    const rows = [...per.values()].filter((s) => pm.get(s.id) && !pm.get(s.id).archived && s.games > 0).sort(sortKey === 'rating' ? byRanking : (a, b) => b[sortKey] - a[sortKey] || b.rating - a.rating);

    view.innerHTML = html`
      <div class="spread" style="margin-bottom:20px">
        <h1 class="page-title">${t('Leaderboard')}</h1>
        <div class="seg" id="range"><button data-r="all" class="${range === 'all' ? 'on' : ''}">${t('All time')}</button><button data-r="year" class="${range === 'year' ? 'on' : ''}">${new Date().getFullYear()}</button></div>
      </div>
      ${rows.length ? html`
        <div class="board-wrap"><table class="board">
          <thead><tr><th class="l">#</th><th class="l">${t('Player')}</th>${COLS.map((c) => `<th data-s="${c.key}" class="${sortKey === c.key ? 'on' : ''}">${t(c.label)}${sortKey === c.key ? ' ▾' : ''}</th>`)}</tr></thead>
          <tbody>${rows.map((s, i) => {
            const p = pm.get(s.id);
            return html`<tr class="top${i + 1}" data-id="${s.id}"><td class="rank">${i + 1}</td>
              <td class="l"><div class="who">${avatar(p)}<span>${esc(p.name)}${s.rookie ? `<span class="tag rookie">${t('Rookie')}</span>` : ''}</span></div></td>
              ${COLS.map((c) => `<td class="${c.cls || ''}">${c.fmt ? c.fmt(s[c.key]) : s[c.key]}</td>`)}</tr>`;
          })}</tbody>
        </table></div>
        <p class="explain" style="margin-top:18px">
          <b class="brass">${t('How the rating works.')}</b>
          ${t('RATING_EXPLAIN', { k: PRIOR_LEGS, avg: fmt1(houseAvg), r: ROOKIE_LEGS, g: totalGames })}
        </p>`
      : `<div class="empty-state"><h2>${t('No games yet')}</h2><p>${t('Finish a game and the leaderboard fills up.')}</p><a class="btn btn-primary btn-lg" href="#/setup">${t('New 301 game')}</a></div>`}`;

    $$('[data-s]', view).forEach((th) => (th.onclick = () => { sortKey = th.dataset.s; draw(); }));
    $$('[data-r]', view).forEach((b) => (b.onclick = () => { range = b.dataset.r; draw(); }));
    $$('tr[data-id]', view).forEach((tr) => (tr.onclick = () => { location.hash = `#/player/${tr.dataset.id}`; }));
  };
  draw();
}
