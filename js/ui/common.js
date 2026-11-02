// Small DOM helpers shared by all screens.
import { t, locale } from '../i18n.js';

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function html(strings, ...vals) {
  return strings.reduce((out, s, i) => out + s + (i < vals.length ? (Array.isArray(vals[i]) ? vals[i].join('') : vals[i] ?? '') : ''), '');
}

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// Object URLs for player photos, created once per blob.
const urls = new WeakMap();
export function photoUrl(p) {
  if (!p || !p.photo) return null;
  if (!urls.has(p.photo)) urls.set(p.photo, URL.createObjectURL(p.photo));
  return urls.get(p.photo);
}

export function initials(name) {
  return esc((name || '?').trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase());
}

export function avatar(p, extra = '') {
  const url = photoUrl(p);
  const color = p?.color || '#5b6b63';
  return `<div class="avatar ${extra}" style="--c:${color}">${url ? `<img src="${url}" alt="">` : initials(p?.name)}</div>`;
}


export function toast(msg, ms = 2200) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), ms);
}

// Modal: returns { el, close }. onClose runs once.
export function modal(inner, { onClose, dismissable = true } = {}) {
  const back = document.createElement('div');
  back.className = 'modal-back';
  back.innerHTML = `<div class="modal">${inner}</div>`;
  document.getElementById('overlay-root').appendChild(back);
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    back.remove();
    onClose && onClose();
  };
  if (dismissable) back.addEventListener('click', (e) => { if (e.target === back) close(); });
  return { el: back.querySelector('.modal'), close };
}

export function confirmBox(title, text, okLabel = t('OK'), danger = false) {
  return new Promise((resolve) => {
    let answer = false;
    const m = modal(html`
      <h2>${esc(title)}</h2>
      <p class="muted" style="font-size:17px;line-height:1.5">${esc(text)}</p>
      <div class="row" style="justify-content:flex-end;margin-top:20px">
        <button class="btn btn-ghost" data-a="no">${t('Cancel')}</button>
        <button class="btn ${danger ? 'btn-red' : 'btn-primary'}" data-a="yes">${esc(okLabel)}</button>
      </div>`, { onClose: () => resolve(answer) });
    m.el.addEventListener('click', (e) => {
      const a = e.target.closest('[data-a]')?.dataset.a;
      if (!a) return;
      answer = a === 'yes';
      m.close();
    });
  });
}

// Player colours: the brand palette first, then a few extra so groups stay easy to tell apart.
export const COLORS = ['#C8743A', '#F40C0C', '#3E8989', '#4E8CC2', '#7899D4', '#048BA8', '#71816D', '#E39A62', '#B07BE6', '#8A9097'];

export function fmtDate(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString(locale(), { day: 'numeric', month: 'short', year: 'numeric' });
}
