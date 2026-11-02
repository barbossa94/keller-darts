import * as db from '../db.js';
import * as cam from '../camera.js';
import { t } from '../i18n.js';
import { html, esc, avatar, modal, toast, COLORS, $ } from './common.js';

export async function render(view) {
  const list = (await db.players()).filter((p) => !p.archived).sort((a, b) => a.name.localeCompare(b.name));
  view.innerHTML = html`
    <div class="spread" style="margin-bottom:20px">
      <h1 class="page-title">${t('Players')}</h1>
      <button class="btn btn-primary" id="add">${t('+ New player')}</button>
    </div>
    <div class="grid player-grid">
      <button class="player-card add" id="add2"><span class="plus">+</span><span>${t('Add player')}</span></button>
      ${list.map((p) => html`
        <a class="player-card" href="#/player/${p.id}">
          ${avatar(p)}
          <div class="name">${esc(p.name)}</div>
          ${p.nickname ? `<div class="sub">"${esc(p.nickname)}"</div>` : ''}
        </a>`)}
    </div>`;
  const add = async () => { if (await editPlayer()) render(view); };
  $('#add', view).onclick = add;
  $('#add2', view).onclick = add;
}

// Add or edit a player. Resolves with the saved player, or null if cancelled.
export function editPlayer(existing = null) {
  return new Promise((resolve) => {
    const p = existing ? { ...existing } : { id: db.uid(), name: '', nickname: '', color: COLORS[Math.floor(Math.random() * COLORS.length)], photo: null, createdAt: Date.now(), archived: false };
    let photo = p.photo;
    let facing = 'user';
    let live = false;
    let saved = null;

    const m = modal(html`
      <h2>${existing ? t('Edit player') : t('New player')}</h2>
      <div class="stack">
        <div class="cam" id="cam">
          <video playsinline muted style="display:none"></video>
          <img alt="" style="display:none">
          <div class="cam-msg">${t('No photo yet')}</div>
        </div>
        <div class="row" style="justify-content:center">
          <button class="btn" id="cam-start">${t('📷 Take photo')}</button>
          <button class="btn btn-primary" id="cam-snap" style="display:none">${t('Snap')}</button>
          <button class="btn" id="cam-flip" style="display:none">${t('Flip camera')}</button>
          <label class="btn btn-ghost" id="cam-file">${t('Choose image')}<input type="file" accept="image/*" capture="user" hidden></label>
        </div>
        <div class="field"><label>${t('Name')}</label><input class="input" id="name" maxlength="24" value="${esc(p.name)}" placeholder="${t('e.g. Martin')}"></div>
        <div class="field"><label>${t('Nickname (optional)')}</label><input class="input" id="nick" maxlength="24" value="${esc(p.nickname)}" placeholder="${t('e.g. The Bull')}"></div>
        <div class="field"><label>${t('Colour')}</label><div class="swatches">${COLORS.map((c) => `<button class="swatch ${c === p.color ? 'on' : ''}" data-c="${c}" style="background:${c}"></button>`)}</div></div>
        <div class="spread" style="margin-top:8px">
          ${existing ? `<button class="btn btn-ghost" id="archive">${p.archived ? t('Restore') : t('Archive')}</button>` : '<span></span>'}
          <div class="row"><button class="btn btn-ghost" id="cancel">${t('Cancel')}</button><button class="btn btn-primary" id="save">${t('Save')}</button></div>
        </div>
      </div>`, { onClose: () => { cam.stop(); resolve(saved); } });

    const el = m.el;
    const video = $('video', el), img = $('img', el), msg = $('.cam-msg', el);
    const show = () => {
      video.style.display = live ? '' : 'none';
      img.style.display = !live && photo ? '' : 'none';
      msg.style.display = !live && !photo ? '' : 'none';
      if (!live && photo) img.src = URL.createObjectURL(photo);
      $('#cam-snap', el).style.display = live ? '' : 'none';
      $('#cam-flip', el).style.display = live ? '' : 'none';
      $('#cam-start', el).style.display = live ? 'none' : '';
      $('#cam-start', el).textContent = photo ? t('📷 Retake') : t('📷 Take photo');
    };
    show();

    const startCam = async () => {
      if (!cam.supported()) { $('input[type=file]', el).click(); return; }
      try {
        await cam.start(video, facing);
        live = true;
      } catch (err) {
        msg.textContent = t('Camera not available. Use "Choose image" instead.');
        live = false;
      }
      show();
    };
    $('#cam-start', el).onclick = startCam;
    $('#cam-flip', el).onclick = () => { facing = facing === 'user' ? 'environment' : 'user'; startCam(); };
    $('#cam-snap', el).onclick = async () => {
      photo = await cam.snap(video);
      cam.stop();
      live = false;
      show();
    };
    $('input[type=file]', el).onchange = async (e) => {
      const f = e.target.files[0];
      if (!f) return;
      photo = await cam.fromFile(f);
      cam.stop();
      live = false;
      show();
    };
    el.querySelectorAll('.swatch').forEach((b) => (b.onclick = () => {
      p.color = b.dataset.c;
      el.querySelectorAll('.swatch').forEach((x) => x.classList.toggle('on', x === b));
    }));
    $('#cancel', el).onclick = m.close;
    const archive = $('#archive', el);
    if (archive) archive.onclick = async () => {
      p.archived = !p.archived;
      await db.savePlayer({ ...p, photo });
      saved = p;
      toast(p.archived ? t('Archived. Stats are kept.') : t('Restored'));
      m.close();
      location.hash = '#/players';
    };
    $('#save', el).onclick = async () => {
      const name = $('#name', el).value.trim();
      if (!name) { toast(t('Give the player a name')); $('#name', el).focus(); return; }
      Object.assign(p, { name, nickname: $('#nick', el).value.trim(), photo });
      await db.savePlayer(p);
      saved = p;
      m.close();
    };
    if (!existing) setTimeout(() => $('#name', el).focus(), 50);
  });
}
