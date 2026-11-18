// Движок монтажа GTA 6 в стиле референса (светлая студия, вырезки, карточки геймплея, иконки, подписи).
// Время — секунды озвучки (gta6/voice/gta6_voice_main.mp3). window.renderAt(t) рисует кадр детерминированно.
'use strict';
const $ = (id) => document.getElementById(id);
const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (t, a, b) => (b <= a ? (t >= a ? 1 : 0) : cl((t - a) / (b - a)));
const lerp = (a, b, k) => a + (b - a) * k;
const E = {
  oc: (x) => 1 - (1 - x) ** 3, oq: (x) => 1 - (1 - x) ** 4, ic: (x) => x * x * x, io: (x) => (x < .5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2),
  ob: (x, c1 = 1.4) => { const c3 = c1 + 1; return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2; },
  sp: (x) => 1 - Math.exp(-7 * x) * Math.cos(11 * x),
};
const FPS_CLIP = 60;
const STAGE = $('stage');
const SCENES = []; const CLIPUSE = []; const PENDING = [];
window.CLIPUSE = CLIPUSE;
let CUR = null;
const ASSET = (p) => p.startsWith('http') || p.startsWith('/') || p.startsWith('.') ? p : 'img/' + p;
function setSrc(img, src) { if (img.getAttribute('src') !== src) { img.setAttribute('src', src); PENDING.push(img.decode().catch(() => {})); } }
function mk(tag, cls, css, parent) { const e = document.createElement(tag); if (cls) e.className = cls; if (css) e.style.cssText = css; (parent || STAGE).appendChild(e); return e; }

// ---------- клипы ----------
// пул свободных отрезков геймплея для фонов (pool.js: [клип, начало, длина]); берётся по очереди, без повторов
const POOLQ = (window.POOL || []).map((p) => p.slice());
function POOL_TAKE(need) { for (const p of POOLQ) { if (p[2] >= need) { const r = [p[0], p[1]]; p[1] += need + 0.05; p[2] -= need + 0.05; POOLQ.push(POOLQ.splice(POOLQ.indexOf(p), 1)[0]); return r; } } return null; }
let clipN = 0;
function useClip(name, off, dur, at = 0, small = false) { const key = `${String(clipN++).padStart(3, '0')}_${name}`; CLIPUSE.push({ key, name, off: +off.toFixed(3), dur: +dur.toFixed(3), at: +at.toFixed(3), small }); return key; }
function clipFrame(key, local, dur) { const n = Math.round(dur * FPS_CLIP); const f = 1 + cl(Math.floor(local * FPS_CLIP), 0, n - 1); return `clips/${key}/${String(f).padStart(4, '0')}.jpg`; }

// ---------- элементы ----------
// общий вход/выход; x,y — центр; at/out — абсолютное время
function enterTf(it, t) {
  const k = seg(t, it.at, it.at + (it.ein || 0.42));
  let o = 1, tx = 0, ty = 0, s = 1, r = 0, bl = 0;
  switch (it.enter) {
    case 'pop': { const e = E.ob(k, 1.7); s = 0.55 + 0.45 * e; o = cl(k * 3); break; }
    case 'zoom': { const e = E.oq(k); s = lerp(1.7, 1, e); bl = 14 * (1 - e); o = cl(k * 2.5); break; }
    case 'up': { const e = E.oq(k); ty = 90 * (1 - e); o = cl(k * 2.2); break; }
    case 'down': { const e = E.oq(k); ty = -90 * (1 - e); o = cl(k * 2.2); break; }
    case 'left': { const e = E.oq(k); tx = -520 * (1 - e); o = cl(k * 3); r = -4 * (1 - e); break; }
    case 'right': { const e = E.oq(k); tx = 520 * (1 - e); o = cl(k * 3); r = 4 * (1 - e); break; }
    case 'drop': { const e = E.ob(k, 1.2); ty = -380 * (1 - e); o = cl(k * 4); break; }
    case 'rise': { const e = E.ob(k, 1.1); ty = 520 * (1 - e); o = cl(k * 4); break; }
    case 'spin': { const e = E.ob(k, 1.5); s = 0.3 + 0.7 * e; r = -160 * (1 - E.oq(k)); o = cl(k * 3); break; }
    case 'none': break;
    default: o = E.oc(k);
  }
  if (it.out != null) {
    const q = seg(t, it.out, it.out + 0.28);
    if (q > 0) { o *= 1 - E.ic(q); s *= 1 - 0.12 * q; ty += (it.exitY || 0) * E.ic(q); tx += (it.exitX || 0) * E.ic(q); }
  }
  if (it.float) { ty += Math.sin((t + it.ph) * 1.25) * it.float; r += Math.sin((t + it.ph) * 0.9) * it.float * 0.06; }
  return { o, tx, ty, s, r, bl };
}
// камера сцены: смещение для параллакса (передний план двигается сильнее заднего)
let CAMX = 0, CAMY = 0;
const PAR = { card: 0.55, photo: 0.55, img: 1.25, txt: 0.85, emo: 1.1, icons: 0.9, stars: 0.9, num: 0.85, x: 1.1, check: 1.1, chip: 1.0, bar: 0.8, ring: 0.9, arrow: 0.8 };
let MBN = 0; const MBDEFS = document.getElementById('mbdefs');
function mbFilter(it, sx, sy) {   // направленное размытие в движении (SVG), своё на каждый элемент
  if (!it.mb) { it.mb = 'mb' + (MBN++); MBDEFS.insertAdjacentHTML('beforeend', `<filter id="${it.mb}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="0 0"/></filter>`); it.mbG = MBDEFS.lastElementChild.firstElementChild; }
  it.mbG.setAttribute('stdDeviation', `${sx.toFixed(2)} ${sy.toFixed(2)}`); return `url(#${it.mb})`;
}
function place(it, t, extra = '') {
  const v = enterTf(it, t);
  const vis = t >= it.at - 0.01 && (it.out == null || t < it.out + 0.3);
  it.el.style.display = vis ? (it.disp || 'block') : 'none';
  if (!vis) return false;
  it.el.style.opacity = v.o.toFixed(3);
  const par = it.par ?? PAR[it.kind] ?? 1;
  it.el.style.transform = `translate(-50%,-50%) translate(${(it.x + v.tx + CAMX * par).toFixed(2)}px,${(it.y + v.ty + CAMY * par).toFixed(2)}px) rotate(${((it.rot || 0) + v.r).toFixed(2)}deg) scale(${(v.s * (it.sc || 1)).toFixed(4)}) ${extra}`;
  const f = [];
  // скорость элемента за 1/120 с -> длина смаза (затвор 180° при 60 к/с)
  const p = enterTf(it, t - 1 / 120); const mx = Math.abs(v.tx - p.tx) / 2.4, my = Math.abs(v.ty - p.ty) / 2.4;
  if (it.kind !== 'txt' && (mx > 0.6 || my > 0.6)) f.push(mbFilter(it, Math.min(mx, 40), Math.min(my, 40)));
  if (v.bl > 0.05) f.push(`blur(${v.bl.toFixed(1)}px)`);
  if (it.blur) f.push(`blur(${it.blur}px)`);
  if (it.shadow !== false && it.kind !== 'txt') f.push(it.kind === 'card' || it.kind === 'photo' ? '' : 'drop-shadow(0 22px 22px rgba(0,0,0,.22)) drop-shadow(0 4px 6px rgba(0,0,0,.14))');
  it.el.style.filter = f.filter(Boolean).join(' ') || 'none';
  return true;
}
let PH_N = 0; // фаза покачивания — детерминированная (одинаковая во всех потоках рендера)
function base(kind, o) { return Object.assign({ kind, x: 960, y: 540, at: 0, enter: 'pop', ph: ((++PH_N) * 2.399) % 6.283 }, o); }

function IMG(src, o = {}) { const it = base('img', o); it.src = ASSET(src); return it; }
function PHOTO(src, at, o = {}) { if (typeof at === 'object') o = at; else o = Object.assign({ at }, o); const it = base('photo', Object.assign({ float: 0 }, o)); it.src = ASSET(src); return it; }
function CARD(clip, o = {}) { const it = base('card', o); it.clip = clip; return it; }
function TXT(text, o = {}) { const it = base('txt', Object.assign({ enter: 'words', size: 64 }, o)); it.text = text; return it; }
function EMO(ch, o = {}) { const it = base('emo', Object.assign({ size: 150 }, o)); it.ch = ch; return it; }
function ICONS(list, o = {}) { const it = base('icons', Object.assign({ size: 120, gap: 24, step: 0.35, enter: 'none' }, o)); it.list = list; return it; }
function STARS(n, o = {}) { const it = base('stars', Object.assign({ size: 110, gap: 18, step: 0.12, color: '#e9506a', enter: 'none' }, o)); it.n = n; return it; }
function NUM(a, b, o = {}) { const it = base('num', Object.assign({ size: 150, dur: 1.0, suffix: '', prefix: '', color: '#151515', enter: 'pop' }, o)); it.a = a; it.b = b; return it; }
function XMARK(o = {}) { const it = base('x', Object.assign({ size: 300, enter: 'none', shadow: false }, o)); return it; }
function CHECK(o = {}) { const it = base('check', Object.assign({ size: 200, enter: 'none', shadow: false }, o)); return it; }
function CHIP(label, o = {}) { const it = base('chip', Object.assign({ size: 260 }, o)); it.label = label; return it; }
function BAR(o = {}) { const it = base('bar', Object.assign({ w: 900, from: 0, to: 100, dur: 1.5, label: '', enter: 'up' }, o)); return it; }
function ARROW(o = {}) { const it = base('arrow', Object.assign({ x1: 700, y1: 540, x2: 1220, y2: 540, enter: 'none', shadow: false, color: '#151515' }, o)); return it; }
function RING(o = {}) { const it = base('ring', Object.assign({ size: 420, enter: 'none', shadow: false, color: '#e1252d' }, o)); return it; }

// сцена: SC(t0, bg, ...items); конец — начало следующей
// bg: 'light' | 'dark' | {blur:'clip', off, dark:true} | {full:'clip', off}
function SC(t0, bg, ...items) { SCENES.push({ t0, bg, items }); }

// ---------- построение DOM ----------
const STAR_SVG = (c) => `<svg viewBox="0 0 100 95" width="100%" height="100%"><path d="M50 4l13.6 29.2 31.9 3.8-23.6 21.9 6.3 31.5L50 74.8 21.8 90.4l6.3-31.5L4.5 37l31.9-3.8z" fill="${c}" stroke="rgba(0,0,0,.25)" stroke-width="3" stroke-linejoin="round"/></svg>`;
function chipSVG(label, col) {
  let pins = ''; for (let i = 0; i < 6; i++) { const p = 22 + i * 11.2; pins += `<rect x="${p}" y="2" width="5" height="12" rx="1.5" fill="#9aa"/><rect x="${p}" y="86" width="5" height="12" rx="1.5" fill="#9aa"/><rect x="2" y="${p}" width="12" height="5" rx="1.5" fill="#9aa"/><rect x="86" y="${p}" width="12" height="5" rx="1.5" fill="#9aa"/>`; }
  return `<svg viewBox="0 0 100 100" width="100%" height="100%">${pins}<rect x="12" y="12" width="76" height="76" rx="9" fill="#1d2b22" stroke="${col}" stroke-width="4"/><rect x="22" y="22" width="56" height="56" rx="5" fill="${col}"/><text x="50" y="58" text-anchor="middle" font-family="Mont" font-weight="800" font-size="19" fill="#0e1a12">${label}</text></svg>`;
}
function build() {
  SCENES.sort((a, b) => a.t0 - b.t0);
  SCENES.forEach((s, i) => { s.t1 = i + 1 < SCENES.length ? SCENES[i + 1].t0 : DUR; });
  for (const s of SCENES) {
    s.el = mk('div', 'sc', '', STAGE);
    s.bgEl = mk('div', 'bg', '', s.el);
    let bg = s.bg || 'light';
    if (bg.auto) { const need = s.t1 - s.t0 + 0.4; const p = POOL_TAKE(need); if (p) { bg = Object.assign({}, bg, { blur: p[0], off: p[1], px: bg.px || 7, soft: true }); s.bg = bg; } else { bg = 'light'; s.bg = bg; } }
    if (bg === 'light') s.bgEl.className = 'bg light';
    else if (bg === 'dark') s.bgEl.className = 'bg dark';
    else {
      const clip = bg.blur || bg.full; s.bgImg = mk('img', 'bgimg', '', s.bgEl);
      s.bgKey = useClip(clip, bg.off || 0, s.t1 - s.t0 + 0.4, s.t0 - 0.2, !!bg.blur);
      if (bg.blur) { s.bgImg.style.filter = `blur(${bg.px || 16}px) saturate(1.1)`; s.bgImg.style.transform = 'scale(1.12)'; mk('div', bg.dark ? 'veil dark' : bg.soft ? 'veil soft' : 'veil', '', s.bgEl); }
    }
    s.cam = mk('div', 'cam', '', s.el);
    for (const it of s.items) {
      if (it.out != null && it.out > s.t1) it.out = null;
      const end = it.out != null ? it.out + 0.3 : s.t1 + 0.2;
      switch (it.kind) {
        case 'img': case 'photo': {
          it.el = mk('div', 'it', '', s.cam); const im = mk('img', '', `width:${it.w || 500}px;display:block;${it.kind === 'photo' ? `border-radius:${it.r ?? 20}px;box-shadow:0 26px 50px rgba(0,0,0,.24),0 6px 12px rgba(0,0,0,.14);` : ''}${it.h ? `height:${it.h}px;object-fit:cover;` : ''}`, it.el); im.src = it.src; it.im = im; break;
        }
        case 'card': {
          it.el = mk('div', 'it card', `width:${it.w || 900}px;height:${(it.w || 900) * 9 / 16}px;border-radius:${it.r ?? 22}px`, s.cam); it.im = mk('img', '', '', it.el);
          it.key = useClip(it.clip, it.off || 0, end - it.at, it.at); break;
        }
        case 'txt': {
          it.el = mk('div', 'it txt', `font-size:${it.size}px;color:${it.color || '#151515'};font-weight:${it.weight || 800};${it.w ? `width:${it.w}px;` : 'white-space:nowrap;'}text-align:${it.align || 'center'};${it.glow ? 'text-shadow:0 4px 24px rgba(0,0,0,.6);' : ''}`, s.cam);
          const hi = it.hi || [];
          it.el.innerHTML = it.text.split(' ').map((w, i) => w === '|' ? '<br>' : `<span class="w"><span style="${hi.includes(i) ? `color:${it.hic || '#e1252d'}` : ''}">${w}</span></span>`).join(' ');
          it.words = [...it.el.querySelectorAll('.w>span')];
          if (it.ul) it.ulEl = mk('div', 'ul', `background:${it.ul === true ? '#e1252d' : it.ul}`, it.el);
          break;
        }
        case 'emo': it.el = mk('div', 'it emo', `font-size:${it.size}px`, s.cam); it.el.textContent = it.ch; break;
        case 'icons': {
          it.el = mk('div', 'it', 'display:flex;gap:' + it.gap + 'px', s.cam); it.disp = 'flex';
          it.kids = it.list.map((ch) => { const d = mk('div', 'icon', `width:${it.size}px;height:${it.size}px;font-size:${it.size * 0.52}px;background:${it.bgc || '#9e1b24'}`, it.el); d.textContent = ch; return d; });
          break;
        }
        case 'stars': {
          it.el = mk('div', 'it', 'display:flex;gap:' + it.gap + 'px', s.cam); it.disp = 'flex';
          it.kids = Array.from({ length: it.n }, (_, i) => { const d = mk('div', '', `width:${it.size}px;height:${it.size * 0.95}px`, it.el); d.innerHTML = STAR_SVG(it.colors ? it.colors[i] : it.color); return d; });
          break;
        }
        case 'num': it.el = mk('div', 'it txt', `font-size:${it.size}px;color:${it.color};font-weight:900;white-space:nowrap`, s.cam); break;
        case 'x': case 'check': {
          it.el = mk('div', 'it', `width:${it.size}px;height:${it.size}px`, s.cam);
          it.el.innerHTML = it.kind === 'x'
            ? `<svg viewBox="0 0 100 100" width="100%" height="100%" style="overflow:visible"><line x1="12" y1="12" x2="88" y2="88" stroke="#e1252d" stroke-width="13" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/><line x1="88" y1="12" x2="12" y2="88" stroke="#e1252d" stroke-width="13" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>`
            : `<svg viewBox="0 0 100 100" width="100%" height="100%" style="overflow:visible"><polyline points="12,55 40,82 90,18" fill="none" stroke="#2fbf4a" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>`;
          it.lines = [...it.el.querySelectorAll('line,polyline')]; break;
        }
        case 'chip': it.el = mk('div', 'it', `width:${it.size}px;height:${it.size}px`, s.cam); it.el.innerHTML = chipSVG(it.label, it.color || '#4fd66b'); break;
        case 'bar': {
          it.el = mk('div', 'it bar', `width:${it.w}px`, s.cam); it.disp = 'flex';
          it.el.innerHTML = `<div class="bl">${it.label}</div><div class="bt"><div class="bf"></div></div><div class="bp">0%</div>`;
          it.fill = it.el.querySelector('.bf'); it.pct = it.el.querySelector('.bp'); break;
        }
        case 'arrow': {
          it.el = mk('div', 'it', 'left:0;top:0;width:1920px;height:1080px', s.cam);
          const mx = (it.x1 + it.x2) / 2, my = (it.y1 + it.y2) / 2 - (it.bend || 0);
          it.el.innerHTML = `<svg width="1920" height="1080" style="overflow:visible"><path d="M${it.x1} ${it.y1} Q${mx} ${my} ${it.x2} ${it.y2}" fill="none" stroke="${it.color}" stroke-width="12" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>`;
          it.path = it.el.querySelector('path');
          const ang = Math.atan2(it.y2 - my, it.x2 - mx) * 180 / Math.PI;
          it.head = mk('div', '', `position:absolute;left:${it.x2}px;top:${it.y2}px;width:0;height:0;border-left:44px solid ${it.color};border-top:24px solid transparent;border-bottom:24px solid transparent;transform:translate(-30px,-24px) rotate(${ang}deg);transform-origin:30px 24px;opacity:0`, it.el);
          it.x = 960; it.y = 540; break;
        }
        case 'ring': it.el = mk('div', 'it', `width:${it.size}px;height:${it.size}px;border-radius:50%;border:12px solid ${it.color}`, s.cam); break;
      }
      if (it.z != null) it.el.style.zIndex = it.z;
    }
  }
}

// ---------- кадр ----------
function sceneVis(s, t) {
  const W = 0.16;
  const on = t >= s.t0 - W * 0.5 && t < s.t1 + W * 0.5; s.el.style.display = on ? 'block' : 'none'; if (!on) return false;
  const kin = s.t0 <= 0 ? 1 : seg(t, s.t0 - W * 0.5, s.t0 + W * 0.5);
  const kout = s.t1 >= DUR ? 0 : seg(t, s.t1 - W * 0.5, s.t1 + W * 0.5);
  const bl = 14 * ((1 - E.oc(kin)) + E.ic(kout));
  s.el.style.opacity = (kout > 0.5 ? cl((1 - kout) * 2.2) : 1) * cl(kin * 1.6);
  s.el.style.filter = bl > 0.05 ? `blur(${bl.toFixed(2)}px)` : 'none';
  s.el.style.transform = `scale(${((1 + 0.05 * (1 - E.oc(kin))) * (1 + 0.06 * E.ic(kout))).toFixed(4)})`;
  return true;
}
function drawScene(s, t) {
  const L = s.t1 - s.t0, u = seg(t, s.t0 - 0.1, s.t1 + 0.1), k = 0.25 * u + 0.75 * E.oc(u);
  const cam = s.camK || 0.06;
  const dir = (Math.sin(s.t0 * 1.7) > 0 ? 1 : -1), dirY = (Math.cos(s.t0 * 2.3) > 0 ? 1 : -1);
  CAMX = dir * 36 * (k - 0.5); CAMY = dirY * 18 * (k - 0.5);
  s.cam.style.transform = `scale(${(1 + cam * k).toFixed(5)}) rotate(${(dir * 0.5 * (k - 0.5)).toFixed(3)}deg)`;
  if (s.bgImg) s.bgImg.style.translate = `${(CAMX * -0.25).toFixed(2)}px ${(CAMY * -0.25).toFixed(2)}px`;
  if (s.bgImg) { setSrc(s.bgImg, clipFrame(s.bgKey, t - s.t0 + 0.2, L + 0.4)); if (s.bg.full) s.bgImg.style.transform = `scale(${(1.02 + 0.06 * k).toFixed(4)})`; }
  for (const it of s.items) {
    switch (it.kind) {
      case 'img': case 'photo': place(it, t); break;
      case 'card': if (place(it, t)) setSrc(it.im, clipFrame(it.key, t - it.at, (it.out != null ? it.out + 0.3 : s.t1 + 0.2) - it.at)); break;
      case 'txt': {
        if (!place(Object.assign(it, { enter: it.enter === 'words' ? 'none' : it.enter }), t)) break;
        const st = it.stag ?? 0.07;
        it.words.forEach((w, i) => { const q = E.oq(seg(t, it.at + i * st, it.at + i * st + 0.38)); w.style.transform = `translateY(${((1 - q) * 105).toFixed(1)}%)`; });
        if (it.ulEl) { const q = E.oc(seg(t, it.at + it.words.length * st + 0.1, it.at + it.words.length * st + 0.45)); it.ulEl.style.transform = `scaleX(${q.toFixed(3)})`; }
        break;
      }
      case 'emo': case 'chip': case 'ring': place(it, t); if (it.kind === 'ring') { const q = E.oc(seg(t, it.at, it.at + 0.45)); it.el.style.clipPath = `inset(0 ${(100 - q * 100).toFixed(1)}% 0 0)`; } break;
      case 'icons': case 'stars': {
        if (!place(it, t)) break;
        it.kids.forEach((d, i) => { const ta = it.times ? it.times[i] : it.at + i * it.step; const q = seg(t, ta, ta + 0.4); d.style.opacity = cl(q * 3); d.style.transform = `scale(${q > 0 ? (0.4 + 0.6 * E.ob(q, 2)).toFixed(3) : 0.4})`; });
        break;
      }
      case 'num': {
        if (!place(it, t)) break;
        const fmt = (v) => it.prefix + (it.fmt ? it.fmt(v) : Math.round(v).toLocaleString('ru-RU').replace(/\u00a0/g, ' ')) + it.suffix;
        if (!it.wfix) { it.el.style.fontVariantNumeric = 'tabular-nums'; let w = 0; for (const v of [it.a, it.b]) { it.el.textContent = fmt(v); w = Math.max(w, it.el.offsetWidth); } it.el.style.width = Math.ceil(w + 4) + 'px'; it.el.style.textAlign = 'right'; it.wfix = true; }
        const q = E.oc(seg(t, it.at, it.at + it.dur)); it.el.textContent = fmt(lerp(it.a, it.b, q)); break;
      }
      case 'x': case 'check': { if (!place(it, t)) break; it.lines.forEach((ln, i) => { const q = E.oc(seg(t, it.at + i * 0.14, it.at + i * 0.14 + 0.22)); ln.setAttribute('stroke-dashoffset', (1 - q).toFixed(3)); }); break; }
      case 'bar': { if (!place(it, t)) break; const q = E.io(seg(t, it.at + 0.2, it.at + 0.2 + it.dur)); const v = lerp(it.from, it.to, q); it.fill.style.width = v.toFixed(1) + '%'; it.pct.textContent = Math.round(v) + '%'; if (it.col) it.fill.style.background = it.col; break; }
      case 'arrow': { if (!place(it, t)) break; const q = E.oc(seg(t, it.at, it.at + 0.4)); it.path.setAttribute('stroke-dashoffset', (1 - q).toFixed(3)); it.head.style.opacity = q > 0.85 ? 1 : 0; break; }
    }
  }
}
window.renderAt = async function (t) {
  PENDING.length = 0;
  for (const s of SCENES) if (sceneVis(s, t)) drawScene(s, t);
  await Promise.all(PENDING);
  await new Promise(requestAnimationFrame);
};
window.SCENES = SCENES;
