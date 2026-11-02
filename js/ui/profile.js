import * as db from '../db.js';
import { compute, fmt1 } from '../stats.js';
import { editPlayer } from './players.js';
import { t } from '../i18n.js';
import { html, esc, avatar, $, fmtDate } from './common.js';

function chart(history) {
  if (history.length < 2) return `<div class="muted" style="padding:40px 0;text-align:center">${t('The chart appears after two games.')}</div>`;
  const W = 800, H = 220, P = 30;
  const pts = history.slice(-40);
  const vals = pts.map((h) => h.avg);
  const max = Math.ceil(Math.max(...vals) / 10) * 10 || 10;
  const min = Math.max(0, Math.floor(Math.min(...vals) / 10) * 10 - 10);
  const x = (i) => P + (i * (W - 2 * P)) / (pts.length - 1);
  const y = (v) => H - P - ((v - min) * (H - 2 * P)) / (max - min || 1);
  const line = pts.map((h, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(h.avg).toFixed(1)}`).join('');
  const area = `${line}L${x(pts.length - 1)},${H - P}L${x(0)},${H - P}Z`;
  const grid = [min, (min + max) / 2, max].map((v) => `<line x1="${P}" x2="${W - P}" y1="${y(v)}" y2="${y(v)}" stroke="rgba(242,240,235,.08)"/><text x="${P - 6}" y="${y(v) + 4}" text-anchor="end" fill="#5C6168" font-size="12">${Math.round(v)}</text>`).join('');
  const dots = pts.map((h, i) => `<circle cx="${x(i)}" cy="${y(h.avg)}" r="${h.won ? 6 : 4}" fill="${h.won ? '#C8743A' : '#1A1D20'}" stroke="#C8743A" stroke-width="2"><title>${fmtDate(h.at)}: ${fmt1(h.avg)}${h.won ? t(' (won)') : ''}</title></circle>`).join('');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
    <defs><linearGradient id="ga" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#C8743A" stop-opacity=".35"/><stop offset="1" stop-color="#C8743A" stop-opacity="0"/></linearGradient></defs>
    ${grid}<path d="${area}" fill="url(#ga)"/><path d="${line}" fill="none" stroke="#C8743A" stroke-width="3" stroke-linejoin="round"/>${dots}</svg>`;
}

export async function render(view, id) {
  const [games, pm] = await Promise.all([db.finishedGames(), db.playerMap()]);
  const p = pm.get(id);
  if (!p) { view.innerHTML = `<div class="empty-state"><h2>${t('Player not found')}</h2><a class="btn" href="#/players">${t('Back')}</a></div>`; return; }
  const { per, houseAvg } = compute(games);
  const s = per.get(id);
  const stat = (k, v) => `<div class="stat"><div class="k">${k}</div><div class="v">${v}</div></div>`;
  const opps = s ? Object.entries(s.vs).sort((a, b) => b[1].played - a[1].played).slice(0, 8) : [];

  view.innerHTML = html`
    <div class="profile-head" style="margin-bottom:28px">
      ${avatar(p)}
      <div class="stack" style="gap:8px">
        <h1>${esc(p.name)}</h1>
        ${p.nickname ? `<div class="brass" style="font-size:20px;font-weight:700">"${esc(p.nickname)}"</div>` : ''}
        <div class="muted">${t('Joined {date}', { date: fmtDate(p.createdAt) })}${p.archived ? t(' · archived') : ''}</div>
        <div class="row"><button class="btn btn-sm" id="edit">${t('Edit player')}</button><a class="btn btn-sm btn-primary" href="#/setup/${p.id}">${t('Play 301')}</a></div>
      </div>
    </div>
    ${s ? html`
      <div class="grid stat-grid">
        ${stat(t('Rating'), `<span class="brass">${fmt1(s.rating)}</span>`)}
        ${stat(t('3-dart avg'), fmt1(s.avg))}
        ${stat(t('Games'), s.games)}
        ${stat(t('Wins'), `${s.wins} <span class="muted" style="font-size:20px">${Math.round(s.winRate * 100)}%</span>`)}
        ${stat(t('Max 3-dart score'), s.bestVisit)}
        ${stat(t('Best checkout'), s.bestCheckout || '-')}
        ${stat('100+', s.ton)}
        ${stat('140+', s.ton40)}
        ${stat(t('180s'), s.max)}
        ${stat(t('Best streak'), s.bestStreak)}
      </div>
      <div class="grid" style="grid-template-columns:2fr 1fr;margin-top:20px">
        <div class="card"><div class="section-title" style="margin-top:0">${t('Average per game')}</div>${chart(s.history)}
          <div class="muted" style="font-size:13px">${t('House average: {avg}. Gold dots are wins.', { avg: fmt1(houseAvg) })}</div></div>
        <div class="card"><div class="section-title" style="margin-top:0">${t('Head to head')}</div>
          ${opps.length ? opps.map(([oid, r]) => {
            const o = pm.get(oid);
            return html`<a class="h2h" href="#/player/${oid}">${avatar(o)}<span class="name">${esc(o?.name)}</span><span><b>${r.won}</b> <span class="muted">/ ${r.played}</span></span></a>`;
          }) : `<div class="muted">${t('No opponents yet.')}</div>`}
        </div>
      </div>`
    : `<div class="card muted">${t('No games yet. Time to throw some darts.')}</div>`}`;

  $('#edit', view).onclick = async () => { if (await editPlayer(p)) render(view, id); };
}
