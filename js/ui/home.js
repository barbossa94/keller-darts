import * as db from '../db.js';
import { compute, records, fmt1, byRanking } from '../stats.js';
import { t } from '../i18n.js';
import { html, esc, avatar, fmtDate } from './common.js';

function recordTile(label, rec, pm, format = (v) => v, hero = false) {
  const p = rec && pm.get(rec.id);
  return html`
    <div class="record ${hero ? 'hero-record' : ''}">
      <div class="record-label">${label}</div>
      ${rec ? html`
        <div class="record-value">${format(rec.value)}</div>
        <div class="record-who">${avatar(p)}<span>${esc(p?.name)}</span>${rec.at ? `<span class="dim" style="font-weight:500">· ${fmtDate(rec.at)}</span>` : ''}</div>
      ` : `<div class="record-value" style="color:var(--dim)">-</div><div class="record-empty">${t('Nobody yet. Be the first.')}</div>`}
    </div>`;
}

export async function render(view) {
  const [games, pm, current] = await Promise.all([db.finishedGames(), db.playerMap(), db.getCurrent()]);
  const { per, totalGames } = compute(games);
  const rec = records(per);
  const top = [...per.values()].filter((s) => pm.get(s.id) && !pm.get(s.id).archived).sort(byRanking).slice(0, 5);

  view.innerHTML = html`
    <section class="hero">
      <div class="hero-main">
        <img class="hero-board" src="icons/logo.svg" alt="">
        <div>
          <div class="section-title" style="margin-top:0">${t('{n} games played down here', { n: totalGames })}</div>
          <h1>${t('Step up<br>to the <span>oche</span>')}</h1>
        </div>
        <div class="hero-actions">
          ${current ? `<a class="btn btn-primary btn-lg" href="#/play">${t('Resume game')}</a><a class="btn btn-lg" href="#/setup">${t('New 301')}</a>`
                    : `<a class="btn btn-primary btn-lg" href="#/setup">${t('New 301 game')}</a>`}
          <a class="btn btn-lg btn-ghost" href="#/players">${t('+ Player')}</a>
        </div>
      </div>
      <div class="stack">
        <div class="spread"><div class="section-title" style="margin:0">${t('Top of the basement')}</div><a class="btn btn-sm btn-ghost" href="#/board">${t('Full leaderboard')}</a></div>
        <div class="mini-board">
          ${top.length ? top.map((s, i) => {
            const p = pm.get(s.id);
            return html`<a class="mini-row" href="#/player/${p.id}"><span class="rank">${i + 1}</span>${avatar(p)}<span class="name">${esc(p.name)}${s.rookie ? `<span class="tag rookie">${t('Rookie')}</span>` : ''}</span><span class="val">${fmt1(s.rating)}</span></a>`;
          }) : `<div class="card muted">${t('Play a game and the rankings show up here.')}</div>`}
        </div>
      </div>
    </section>

    <div class="section-title" style="margin-top:32px">${t('Hall of Fame')}</div>
    <section class="records">
      ${recordTile(t('Max 3-dart score'), rec.bestVisit, pm, (v) => v, true)}
      ${recordTile(t('Highest checkout'), rec.bestCheckout, pm)}
      ${recordTile(t('Best game average'), rec.bestGameAvg, pm, fmt1)}
      ${recordTile(t('Most 180s'), rec.most180, pm)}
      ${recordTile(t('Longest win streak'), rec.bestStreak, pm)}
    </section>`;
}
