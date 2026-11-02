// Celebrations: synthesized sounds (no audio files), confetti, big-number overlays.
let ctx = null;
let enabled = true;
export const setSound = (on) => { enabled = on; };

function tone(freq, start, dur, type = 'sine', gain = 0.18) {
  if (!enabled) return;
  ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  const t = ctx.currentTime + start;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

export const sounds = {
  tap: () => tone(660, 0, 0.06, 'triangle', 0.06),
  ok: () => { tone(520, 0, 0.1, 'triangle', 0.1); tone(780, 0.07, 0.12, 'triangle', 0.1); },
  bust: () => { tone(200, 0, 0.25, 'sawtooth', 0.08); tone(140, 0.12, 0.35, 'sawtooth', 0.08); },
  ton: () => [523, 659, 784].forEach((f, i) => tone(f, i * 0.08, 0.25, 'triangle', 0.12)),
  max: () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.35, 'square', 0.07)),
  win: () => [392, 523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.13, 0.4, 'triangle', 0.14)),
};

export function confetti(duration = 3500) {
  const c = document.createElement('canvas');
  c.className = 'confetti';
  document.body.appendChild(c);
  const dpr = window.devicePixelRatio || 1;
  const resize = () => { c.width = innerWidth * dpr; c.height = innerHeight * dpr; };
  resize();
  const g = c.getContext('2d');
  const colors = ['#C8743A', '#E39A62', '#F40C0C', '#3E8989', '#F2F0EB'];
  const bits = Array.from({ length: 180 }, () => ({
    x: Math.random() * c.width, y: -Math.random() * c.height * 0.6,
    vx: (Math.random() - 0.5) * 4 * dpr, vy: (2 + Math.random() * 4) * dpr,
    r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
    w: (6 + Math.random() * 8) * dpr, h: (8 + Math.random() * 10) * dpr,
    col: colors[(Math.random() * colors.length) | 0],
  }));
  const end = performance.now() + duration;
  (function frame(now) {
    g.clearRect(0, 0, c.width, c.height);
    for (const b of bits) {
      b.x += b.vx; b.y += b.vy; b.vy += 0.05 * dpr; b.r += b.vr;
      g.save(); g.translate(b.x, b.y); g.rotate(b.r);
      g.fillStyle = b.col; g.fillRect(-b.w / 2, -b.h / 2, b.w, b.h * Math.abs(Math.cos(b.r)));
      g.restore();
    }
    if (now < end) requestAnimationFrame(frame);
    else c.remove();
  })(performance.now());
}

export function flash(big, sub, cls = '') {
  const el = document.createElement('div');
  el.className = `celebrate ${cls}`;
  el.innerHTML = `<div><div class="big">${big}</div>${sub ? `<div class="sub">${sub}</div>` : ''}</div>`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), cls === 'ton' ? 1100 : 2200);
}
