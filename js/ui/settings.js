import * as db from '../db.js';
import { setSound } from '../fx.js';
import { editPlayer } from './players.js';
import { t } from '../i18n.js';
import { html, esc, avatar, $, $$, toast, confirmBox, fmtDate } from './common.js';

const blobToB64 = (blob) => new Promise((r) => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(blob); });
const b64ToBlob = async (url) => (await fetch(url)).blob();

async function exportAll() {
  const players = await db.getAll('players');
  const out = {
    app: 'basement-darts', version: 1, exportedAt: Date.now(),
    players: await Promise.all(players.map(async (p) => ({ ...p, photo: p.photo ? await blobToB64(p.photo) : null }))),
    games: await db.getAll('games'),
  };
  const blob = new Blob([JSON.stringify(out)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `keller-darts-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

async function importAll(file) {
  const data = JSON.parse(await file.text());
  if (data.app !== 'basement-darts') throw new Error(t('Not a Keller Darts backup'));
  await db.clear('players');
  await db.clear('games');
  for (const p of data.players) await db.put('players', { ...p, photo: p.photo ? await b64ToBlob(p.photo) : null });
  for (const g of data.games) await db.put('games', g);
  db.invalidate();
  return { players: data.players.length, games: data.games.length };
}

export async function render(view) {
  const s = await db.settings();
  const games = await db.finishedGames();
  const archived = (await db.players()).filter((p) => p.archived);
  const persisted = navigator.storage?.persisted ? await navigator.storage.persisted() : false;

  view.innerHTML = html`
    <h1 class="page-title" style="margin-bottom:20px">${t('Settings')}</h1>
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(340px,1fr))">
      <div class="card stack">
        <div class="section-title" style="margin:0">${t('Sound')}</div>
        <div class="seg" id="sound"><button data-v="1" class="${s.sound ? 'on' : ''}">${t('On')}</button><button data-v="0" class="${!s.sound ? 'on' : ''}">${t('Off')}</button></div>
        <div class="section-title" style="margin:8px 0 0">${t('Storage')}</div>
        <div class="muted">${t('{n} finished games are stored on this tablet.', { n: games.length })}
          ${persisted ? t('Storage is marked as persistent.') : t('The browser has not marked storage as persistent, so make a backup now and then.')}</div>
      </div>
      <div class="card stack">
        <div class="section-title" style="margin:0">${t('Backup')}</div>
        <div class="muted">${t('Save everything (players, photos, games) to one file. Keep it somewhere safe, for example in cloud storage.')}</div>
        <div class="row">
          <button class="btn btn-primary" id="export">${t('Download backup')}</button>
          <label class="btn">${t('Restore backup')}<input type="file" accept="application/json,.json" hidden id="import"></label>
        </div>
      </div>
      <div class="card stack">
        <div class="section-title" style="margin:0">${t('Archived players')}</div>
        ${archived.length ? archived.map((p) => html`<div class="h2h">${avatar(p)}<span class="name">${esc(p.name)}</span><button class="btn btn-sm" data-edit="${p.id}">${t('Open')}</button></div>`) : `<div class="muted">${t('None.')}</div>`}
      </div>
      <div class="card stack">
        <div class="section-title" style="margin:0">${t('Recent games')}</div>
        ${games.slice(-6).reverse().map((g) => `<div class="muted">${t('{date}: {n} players, {mode}', { date: fmtDate(g.finishedAt), n: g.playerIds.length, mode: g.legsToWin > 1 ? t('first to {n}', { n: g.legsToWin }) : t('single leg') })}${g.doubleOut ? t(', double out') : ''}</div>`).join('') || `<div class="muted">${t('None yet.')}</div>`}
        <button class="btn btn-ghost btn-sm" id="wipe" style="align-self:flex-start;color:var(--red-2)">${t('Delete all data')}</button>
      </div>
    </div>`;

  $$('#sound button', view).forEach((b) => (b.onclick = async () => {
    const on = b.dataset.v === '1';
    await db.saveSettings({ sound: on });
    setSound(on);
    render(view);
  }));
  $('#export', view).onclick = () => exportAll().then(() => toast(t('Backup downloaded')));
  $('#import', view).onchange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!(await confirmBox(t('Restore backup?'), t('This replaces all players and games on this tablet with the backup.'), t('Restore'), true))) return;
    try {
      const r = await importAll(f);
      toast(t('Restored {p} players and {g} games', { p: r.players, g: r.games }));
      render(view);
    } catch (err) { toast(t('Restore failed: {msg}', { msg: err.message })); }
  };
  $$('[data-edit]', view).forEach((b) => (b.onclick = async () => {
    const p = (await db.players()).find((x) => x.id === b.dataset.edit);
    if (p && await editPlayer(p)) render(view);
  }));
  $('#wipe', view).onclick = async () => {
    if (!(await confirmBox(t('Delete all data?'), t('All players, photos and games are removed from this tablet. Download a backup first if you want to keep them.'), t('Delete everything'), true))) return;
    await db.clear('players'); await db.clear('games'); await db.clearCurrent();
    db.invalidate();
    toast(t('All data deleted'));
    render(view);
  };
}
