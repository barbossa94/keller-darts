import * as db from '../db.js';
import { replay, judgeTotal, judgeDarts, suggest, minDarts, dartValue, dartLabel, newGame } from '../x01.js';
import { compute, records, gameLive, fmt1 } from '../stats.js';
import { sounds, flash, confetti } from '../fx.js';
import { t } from '../i18n.js';
import { html, esc, avatar, $, modal, toast, confirmBox } from './common.js';

const QUICK = [26, 41, 45, 60, 100, 140];
let active = null; // cleanup of the running scoring screen (a rematch re-renders in place)

export async function render(view) {
  if (active) active();
  let game = await db.getCurrent();
  if (!game) {
    view.innerHTML = `<div class="empty-state"><h2>${t('No game running')}</h2><p>${t('Start a new 301 to get going.')}</p><a class="btn btn-primary btn-lg" href="#/setup">${t('New game')}</a> <a class="btn btn-lg" href="#/">${t('Home')}</a></div>`;
    return;
  }
  const pm = await db.playerMap();
  const cfg = await db.settings();
  let mode = cfg.inputMode;
  let entry = '';
  let darts = [];
  let mod = 1;
  let busy = false;
  let state = replay(game);

  // Keep the screen on while playing.
  let lock = null;
  const grabLock = async () => { try { if (navigator.wakeLock && document.visibilityState === 'visible') lock = await navigator.wakeLock.request('screen'); } catch {} };
  const onVis = () => { if (document.visibilityState === 'visible') grabLock(); };
  grabLock();
  document.addEventListener('visibilitychange', onVis);

  const draw = () => {
    const cur = pm.get(state.current);
    const rem = state.remaining[state.current];
    const live = gameLive(game, state, state.current);
    const dartsLeft = mode === 'darts' ? 3 - darts.length : 3;
    const remNow = mode === 'darts' ? rem - darts.reduce((a, d) => a + dartValue(d), 0) : rem;
    const co = remNow > 0 ? suggest(remNow, dartsLeft, game.doubleOut) : null;
    const multiLeg = game.legsToWin > 1;

    view.innerHTML = html`
      <div class="play">
        <div class="scoreboard">
          ${game.playerIds.map((id, i) => {
            const p = pm.get(id);
            const g = gameLive(game, state, id);
            return html`<div class="sb-item ${id === state.current ? 'active' : ''}" style="--c:${p?.color}">
              ${avatar(p)}
              <div class="name">${esc(p?.name)}${multiLeg ? `<span class="legs-dots">${Array.from({ length: game.legsToWin }, (_, k) => `<i class="${k < state.legWins[id] ? 'on' : ''}"></i>`).join('')}</span>` : ''}
                <small>${t('avg')} ${fmt1(g.avg)}</small></div>
              <div class="rem">${state.remaining[id]}</div>
            </div>`;
          })}
        </div>

        <div class="stage" style="--pc:${cur?.color || 'var(--brass)'}">
          <div class="play-top">
            <button class="btn btn-sm" id="menu">${t('☰ Menu')}</button>
            <div class="leg-label">${multiLeg ? t('Leg {leg} · first to {n}', { leg: state.leg + 1, n: game.legsToWin }) : '301'}${game.doubleOut ? t(' · double out') : ''}</div>
            <button class="btn btn-sm" id="undo" ${game.visits.length || darts.length || entry ? '' : 'disabled'}>${t('↶ Undo')}</button>
          </div>
          <div class="stage-gap"></div>
          ${avatar(cur)}
          <div class="pname">${esc(cur?.name)}</div>
          <div class="remaining">${remNow}</div>
          <div class="checkout">${co ? `<span class="label">${t('Checkout')}</span>${co.map((d) => `<span class="dart">${dartLabel(d)}</span>`).join('')}` : ''}</div>
          <div class="meta"><span>${t('Game avg')}<b>${fmt1(live.avg)}</b></span><span>${t('Darts')}<b>${live.darts}</b></span>${multiLeg ? `<span>${t('Legs')}<b>${state.legWins[state.current]}</b></span>` : ''}</div>
          <div class="last-visits">${live.last.map((v) => `<span class="${v.bust ? 'bust' : ''}">${v.bust ? t('Bust') : v.score}</span>`).join('')}</div>
        </div>

        <div class="pad-wrap">
          <div class="seg" id="mode" style="align-self:stretch;display:flex">
            <button data-m="total" class="${mode === 'total' ? 'on' : ''}" style="flex:1">${t('3-dart total')}</button>
            <button data-m="darts" class="${mode === 'darts' ? 'on' : ''}" style="flex:1">${t('Dart by dart')}</button>
          </div>
          ${mode === 'total' ? html`
            <div class="entry"><span class="val ${entry ? '' : 'placeholder'}">${entry || '0'}</span><span class="muted">${t('scored')}</span></div>
            <div class="quick">${QUICK.map((q) => `<button class="key" data-q="${q}">${q}</button>`)}</div>
            <div class="keypad">
              ${[7, 8, 9, 4, 5, 6, 1, 2, 3].map((n) => `<button class="key" data-n="${n}">${n}</button>`)}
              <button class="key fn" data-k="back">⌫</button>
              <button class="key" data-n="0">0</button>
              <button class="key ok" data-k="ok">${entry ? t('Enter') : t('No score')}</button>
            </div>
            <div class="quick" style="grid-template-columns:1fr 1fr">
              <button class="key fn" data-k="bust">${t('Bust')}</button>
              <button class="key fn" data-k="out" style="color:var(--green-2)" ${judgeTotal(rem, rem, game.doubleOut).checkout ? '' : 'disabled'}>${t('Checked out')}</button>
            </div>` : html`
            <div class="entry"><div class="darts">${[0, 1, 2].map((i) => darts[i] ? `<span>${dartLabel(darts[i])}</span>` : '<span class="empty">-</span>')}</div>
              <span class="val" style="font-size:44px">${darts.reduce((a, d) => a + dartValue(d), 0)}</span></div>
            <div class="keypad darts">
              ${Array.from({ length: 20 }, (_, i) => `<button class="key" data-d="${i + 1}">${i + 1}</button>`)}
              <button class="key mod ${mod === 2 ? 'on' : ''}" data-mod="2">${t('Double')}</button>
              <button class="key mod t ${mod === 3 ? 'on' : ''}" data-mod="3">${t('Triple')}</button>
              <button class="key" data-d="25">${mod === 2 ? t('Bull') : '25'}</button>
              <button class="key fn" data-d="0">${t('Miss')}</button>
              <button class="key fn" data-k="back">⌫</button>
            </div>
            <button class="key ok ok-bar" data-k="ok">${darts.length ? t('Enter') : t('No score')}</button>`}
        </div>
      </div>`;
    view.querySelector('.sb-item.active')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };

  const save = () => db.setCurrent(game);

  const pushVisit = async (v) => {
    if (busy) return;
    busy = true;
    const before = state;
    game.visits.push({ p: state.current, t: Date.now(), ...v });
    entry = ''; darts = []; mod = 1;
    state = replay(game);
    await save();

    if (v.bust) { sounds.bust(); toast(t('Bust!'), 1200); }
    else if (v.score === 180) { sounds.max(); flash('180', t('One hundred and eighty')); }
    else if (v.score >= 100) { sounds.ton(); flash(v.score, v.score >= 140 ? t('Ton forty+') : t('Ton+'), 'ton'); }
    else sounds.ok();

    if (state.finished) await finish();
    else if (state.leg > before.leg) {
      sounds.win();
      toast(t('Leg to {name}!', { name: pm.get(before.current)?.name }), 2500);
    }
    busy = false;
    if (!state.finished) draw();
  };

  const submitTotal = async (score, forceCheckout = false) => {
    const rem = state.remaining[state.current];
    const j = judgeTotal(rem, score, game.doubleOut);
    if (j.error) { toast(t(j.error, { score })); sounds.bust(); return; }
    if (forceCheckout && !j.checkout) return;
    let used = 3;
    if (j.checkout) {
      const min = minDarts(score, game.doubleOut);
      if (min < 3) {
        used = await askDarts(min);
        if (!used) return;
      }
    }
    pushVisit({ score, darts: used, bust: j.bust, checkout: j.checkout });
  };

  const askDarts = (min) => new Promise((resolve) => {
    let pick = 0;
    const m = modal(html`<h2>${t('Checked out!')}</h2><p class="muted">${t('How many darts did it take?')}</p>
      <div class="row" style="justify-content:center;margin-top:16px">${[1, 2, 3].filter((n) => n >= min).map((n) => `<button class="btn btn-primary btn-lg" data-n="${n}" style="min-width:110px">${n}</button>`)}</div>`,
      { onClose: () => resolve(pick) });
    m.el.addEventListener('click', (e) => { const n = e.target.closest('[data-n]')?.dataset.n; if (n) { pick = +n; m.close(); } });
  });

  const submitDarts = () => {
    const rem = state.remaining[state.current];
    const j = judgeDarts(rem, darts, game.doubleOut);
    const used = darts.slice(0, j.used);
    const score = used.reduce((a, d) => a + dartValue(d), 0);
    pushVisit({ score, darts: j.checkout ? used.length : 3, bust: j.bust, checkout: j.checkout, throws: used.map(dartLabel) });
  };

  const addDart = (n) => {
    if (darts.length >= 3) return;
    const d = n === 0 ? { m: 1, n: 0 } : { m: n === 25 && mod === 3 ? 1 : mod, n };
    darts.push(d);
    mod = 1;
    sounds.tap();
    const j = judgeDarts(state.remaining[state.current], darts, game.doubleOut);
    if (j.bust || j.checkout || darts.length === 3) { draw(); setTimeout(submitDarts, 450); }
    else draw();
  };

  const undo = async () => {
    if (mode === 'darts' && darts.length) { darts.pop(); draw(); return; }
    if (entry) { entry = ''; draw(); return; }
    if (!game.visits.length) return;
    game.visits.pop();
    state = replay(game);
    await save();
    toast(t('Last visit undone'), 1200);
    draw();
  };

  const finish = async () => {
    const pastGames = await db.finishedGames();
    const before = records(compute(pastGames).per);
    game.finishedAt = Date.now();
    game.winnerId = state.winnerId;
    await db.put('games', game);
    await db.clearCurrent();
    const after = records(compute([...pastGames, game]).per);
    const newRecords = [];
    const label = { bestVisit: t('Max 3-dart score'), bestCheckout: t('Highest checkout'), bestGameAvg: t('Best game average') };
    for (const k of Object.keys(label)) {
      if (after[k] && (!before[k] || after[k].value > before[k].value)) newRecords.push(t('{label}: {value} by {name}', { label: label[k], value: k === 'bestGameAvg' ? fmt1(after[k].value) : after[k].value, name: pm.get(after[k].id)?.name }));
    }
    showWinner(newRecords);
  };

  const showWinner = (newRecords) => {
    const w = pm.get(game.winnerId);
    const rows = game.playerIds.map((id) => ({ id, ...gameLive(game, state, id) })).sort((a, b) => (b.id === game.winnerId) - (a.id === game.winnerId) || b.avg - a.avg);
    const bestVisit = Math.max(0, ...game.visits.filter((v) => v.p === game.winnerId && !v.bust).map((v) => v.score));
    const el = document.createElement('div');
    el.className = 'winner';
    el.innerHTML = html`
      <div class="winner-card">
        <div class="crown">${t('Winner')}</div>
        ${avatar(w)}
        <h1>${esc(w?.name)}</h1>
        <div class="winner-stats">
          <div class="stat"><div class="k">${t('Game avg')}</div><div class="v">${fmt1(gameLive(game, state, game.winnerId).avg)}</div></div>
          <div class="stat"><div class="k">${t('Max 3-dart')}</div><div class="v">${bestVisit}</div></div>
          <div class="stat"><div class="k">${t('Darts')}</div><div class="v">${gameLive(game, state, game.winnerId).darts}</div></div>
        </div>
        ${newRecords.length ? `<div class="card" style="border-color:var(--brass)"><div class="section-title brass" style="margin-top:0">${t('🏆 New basement record')}</div>${newRecords.map((r) => `<div style="font-weight:700;font-size:18px">${esc(r)}</div>`).join('')}</div>` : ''}
        ${game.playerIds.length > 1 ? html`<div class="final-table">${rows.map((r) => html`<div class="final-row">${avatar(pm.get(r.id))}<span class="name">${esc(pm.get(r.id)?.name)}</span><span class="muted">${t('{n} darts', { n: r.darts })}</span><span>${t('avg')} <b>${fmt1(r.avg)}</b></span></div>`)}</div>` : ''}
        <div class="row" style="justify-content:center">
          <button class="btn btn-primary btn-lg" data-w="rematch">${t('Rematch')}</button>
          <button class="btn btn-lg" data-w="board">${t('Leaderboard')}</button>
          <button class="btn btn-lg btn-ghost" data-w="home">${t('Home')}</button>
        </div>
      </div>`;
    document.getElementById('overlay-root').appendChild(el);
    sounds.win();
    confetti(4500);
    el.addEventListener('click', async (e) => {
      const a = e.target.closest('[data-w]')?.dataset.w;
      if (!a) return;
      if (a === 'rematch') {
        // Rotate the order so somebody else throws first.
        const ids = [...game.playerIds.slice(1), game.playerIds[0]];
        await db.setCurrent(newGame({ playerIds: ids, doubleOut: game.doubleOut, legsToWin: game.legsToWin, start: game.start }));
        el.remove();
        render(view);
      } else location.hash = a === 'board' ? '#/board' : '#/';
    });
  };

  const openMenu = () => {
    const m = modal(html`<h2>${t('Game menu')}</h2><div class="stack">
      <button class="btn btn-lg" data-a="pause">${t('Pause, back to home')}</button>
      <button class="btn btn-lg btn-red" data-a="abandon">${t('Abandon game')}</button>
      <button class="btn btn-ghost" data-a="close">${t('Keep playing')}</button></div>`);
    m.el.addEventListener('click', async (e) => {
      const a = e.target.closest('[data-a]')?.dataset.a;
      if (!a) return;
      m.close();
      if (a === 'pause') location.hash = '#/';
      if (a === 'abandon' && await confirmBox(t('Abandon game?'), t('This game will not count for the leaderboard.'), t('Abandon'), true)) {
        await db.clearCurrent();
        location.hash = '#/';
      }
    });
  };

  view.onclick = (e) => {
    const b = e.target.closest('button');
    if (!b || busy) return;
    if (b.id === 'menu') return openMenu();
    if (b.id === 'undo') return undo();
    if (b.dataset.m) { mode = b.dataset.m; entry = ''; darts = []; mod = 1; db.saveSettings({ inputMode: mode }); return draw(); }
    if (b.dataset.n !== undefined) {
      const next = (entry + b.dataset.n).replace(/^0+(?=\d)/, '');
      if (+next <= 180) { entry = next; sounds.tap(); draw(); }
      return;
    }
    if (b.dataset.q) return submitTotal(+b.dataset.q);
    if (b.dataset.mod) { mod = mod === +b.dataset.mod ? 1 : +b.dataset.mod; return draw(); }
    if (b.dataset.d !== undefined) return addDart(+b.dataset.d);
    const k = b.dataset.k;
    if (k === 'back') {
      if (mode === 'darts') darts.pop(); else entry = entry.slice(0, -1);
      return draw();
    }
    if (k === 'ok') return mode === 'total' ? submitTotal(+entry || 0) : submitDarts();
    if (k === 'bust') return pushVisit({ score: 0, darts: 3, bust: true, checkout: false });
    if (k === 'out') return submitTotal(state.remaining[state.current], true);
  };

  const onKey = (e) => {
    if (mode !== 'total' || busy || document.querySelector('.modal-back, .winner')) return;
    if (/^\d$/.test(e.key)) { const next = (entry + e.key).replace(/^0+(?=\d)/, ''); if (+next <= 180) { entry = next; draw(); } }
    else if (e.key === 'Backspace') { entry = entry.slice(0, -1); draw(); }
    else if (e.key === 'Enter') submitTotal(+entry || 0);
  };
  document.addEventListener('keydown', onKey);

  draw();
  active = () => {
    view.onclick = null;
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('visibilitychange', onVis);
    try { lock && lock.release(); } catch {}
    active = null;
  };
  return () => active && active();
}
