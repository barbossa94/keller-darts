import * as db from '../db.js';
import { newGame } from '../x01.js';
import { editPlayer } from './players.js';
import { t } from '../i18n.js';
import { html, esc, avatar, $, $$, confirmBox, toast } from './common.js';

export async function render(view, preselect) {
  const cfg = await db.settings();
  const order = preselect ? [preselect] : [];
  let doubleOut = cfg.doubleOut;
  let legs = cfg.legs;

  const draw = async () => {
    const list = (await db.players()).filter((p) => !p.archived).sort((a, b) => a.name.localeCompare(b.name));
    const pm = new Map(list.map((p) => [p.id, p]));
    view.innerHTML = html`
      <div class="setup">
        <div>
          <div class="spread" style="margin-bottom:16px">
            <h1 class="page-title">${t('New 301')}</h1>
            <span class="muted">${t('Tap players in throwing order')}</span>
          </div>
          <div class="grid player-grid">
            <button class="player-card add" id="add"><span class="plus">+</span><span>${t('New player')}</span></button>
            ${list.map((p) => {
              const i = order.indexOf(p.id);
              return html`<button class="player-card ${i >= 0 ? 'selected' : ''}" data-id="${p.id}">
                ${i >= 0 ? `<span class="badge-order">${i + 1}</span>` : ''}${avatar(p)}<div class="name">${esc(p.name)}</div></button>`;
            })}
          </div>
        </div>
        <div class="card stack sticky">
          <div class="spread"><div class="section-title" style="margin:0">${t('Throwing order')}</div>
            <button class="btn btn-sm" id="shuffle" ${order.length < 2 ? 'disabled' : ''}>${t('🎲 Shuffle')}</button></div>
          <div class="order-list">
            ${order.length ? order.map((id, i) => html`
              <div class="order-item">
                <span class="num">${i + 1}</span>${avatar(pm.get(id))}<span class="name">${esc(pm.get(id)?.name)}</span>
                <button class="btn" data-up="${i}" ${i === 0 ? 'disabled' : ''}>▲</button>
                <button class="btn" data-down="${i}" ${i === order.length - 1 ? 'disabled' : ''}>▼</button>
                <button class="btn" data-rm="${i}">✕</button>
              </div>`) : `<div class="muted">${t('Nobody picked yet.')}</div>`}
          </div>
          <div class="field"><label>${t('Finish')}</label>
            <div class="seg" id="out"><button data-v="0" class="${!doubleOut ? 'on' : ''}">${t('Straight out')}</button><button data-v="1" class="${doubleOut ? 'on' : ''}">${t('Double out')}</button></div></div>
          <div class="field"><label>${t('Legs to win')}</label>
            <div class="seg" id="legs">${[1, 2, 3, 4].map((n) => `<button data-v="${n}" class="${legs === n ? 'on' : ''}">${n === 1 ? t('1 leg') : t('{n} legs', { n })}</button>`)}</div></div>
          <button class="btn btn-primary btn-lg" id="start" ${order.length ? '' : 'disabled'}>${t('Game on')}</button>
        </div>
      </div>`;

    $$('.player-card[data-id]', view).forEach((b) => (b.onclick = () => {
      const i = order.indexOf(b.dataset.id);
      if (i >= 0) order.splice(i, 1); else order.push(b.dataset.id);
      draw();
    }));
    $('#add', view).onclick = async () => {
      const p = await editPlayer();
      if (p) { order.push(p.id); draw(); }
    };
    $('#shuffle', view).onclick = () => {
      for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
      draw();
    };
    view.querySelectorAll('[data-up]').forEach((b) => (b.onclick = () => { const i = +b.dataset.up; [order[i - 1], order[i]] = [order[i], order[i - 1]]; draw(); }));
    view.querySelectorAll('[data-down]').forEach((b) => (b.onclick = () => { const i = +b.dataset.down; [order[i + 1], order[i]] = [order[i], order[i + 1]]; draw(); }));
    view.querySelectorAll('[data-rm]').forEach((b) => (b.onclick = () => { order.splice(+b.dataset.rm, 1); draw(); }));
    $$('#out button', view).forEach((b) => (b.onclick = () => { doubleOut = b.dataset.v === '1'; draw(); }));
    $$('#legs button', view).forEach((b) => (b.onclick = () => { legs = +b.dataset.v; draw(); }));
    $('#start', view).onclick = async () => {
      if (!order.length) return;
      if (await db.getCurrent()) {
        const ok = await confirmBox(t('Game in progress'), t('There is an unfinished game. Starting a new one throws it away.'), t('Start new'), true);
        if (!ok) return;
      }
      await db.saveSettings({ doubleOut, legs });
      await db.setCurrent(newGame({ playerIds: [...order], doubleOut, legsToWin: legs }));
      location.hash = '#/play';
    };
  };
  if (!(await db.players()).length) toast(t('Add your first player to get started'));
  await draw();
}
