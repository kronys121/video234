// GTA 4 на PS3 — вертикальное видео 1080×1920. Стиль: дебаг-экран разработчика + 3D-вставки.
// window.renderAt(t) рисует кадр на момент t (сек) детерминированно; рендерер делает скриншот.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// ---------- палитра / математика ----------
const CY = '#4cc9f0', GR = '#39ff88', AM = '#ffb000', RD = '#ff3b4e', WH = '#e8f1ff', DIM = '#5d6b82', BG = '#060a12';
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const P = (t, a, d) => clamp((t - a) / d);
const lerp = (a, b, k) => a + (b - a) * k;
const E = {
  outCubic: (x) => 1 - Math.pow(1 - x, 3), inCubic: (x) => x * x * x,
  inOut: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  outBack: (x) => { const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
};
const fr = (x) => x - Math.floor(x);
const rnd = (i, k = 0) => fr(Math.sin(i * 127.1 + k * 311.7) * 43758.5453);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

// ---------- DOM ----------
const stage = document.getElementById('stage'), fx = document.getElementById('fx');
function div(parent, css, html = '') { const d = document.createElement('div'); d.style.cssText = css; d.innerHTML = html; parent.appendChild(d); return d; }
function ab(parent, css, html = '') { const d = div(parent, css, html); d.classList.add('abs'); return d; }
function tf(el, { x = 0, y = 0, s = 1, sx = null, sy = null, r = 0, o = 1, ax = 0.5, ay = 0.5 } = {}) {
  el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(${-ax * 100}%,${-ay * 100}%) rotate(${r.toFixed(2)}deg) scale(${(sx ?? s).toFixed(3)},${(sy ?? s).toFixed(3)})`;
  el.style.opacity = o;
}
function img(parent, src, css) { const i = new Image(); i.src = src; i.style.cssText = 'position:absolute;left:0;top:0;' + css; parent.appendChild(i); return i; }
const pend = [];

// печатающийся текст: segs = [[текст, цвет], ...]
function typer(parent, css, segs) { const d = ab(parent, css); d.segs = typeof segs === 'string' ? [[segs, null]] : segs; d.len = d.segs.reduce((a, s) => a + s[0].length, 0); return d; }
function typeUpd(d, t, t0, cps = 38, caret = true) {
  if (t < t0) { d.style.opacity = 0; return; }
  d.style.opacity = 1;
  let n = Math.floor((t - t0) * cps), h = '';
  for (const [s, c] of d.segs) { const k = Math.min(n, s.length); if (k > 0) h += c ? `<span style="color:${c}">${esc(s.slice(0, k))}</span>` : esc(s.slice(0, k)); n -= k; if (n <= 0) break; }
  const done = Math.floor((t - t0) * cps) >= d.len;
  if (caret && (!done || fr(t * 2) < 0.5)) h += '<span class="caret">█</span>';
  d.innerHTML = h;
}
// окно «отладчика» с заголовком
function win(parent, x, y, w, h, title) {
  const d = ab(parent, `left:${x}px;top:${y}px;width:${w}px;height:${h}px;transform-origin:50% 50%;border:2px solid rgba(76,201,240,.55);background:rgba(7,14,26,.88);box-shadow:0 0 60px rgba(76,201,240,.10) inset,0 20px 60px rgba(0,0,0,.6)`);
  div(d, `position:absolute;left:0;top:0;right:0;height:46px;background:rgba(76,201,240,.13);border-bottom:2px solid rgba(76,201,240,.4);font-weight:700;font-size:23px;color:${CY};display:flex;align-items:center;padding:0 16px;gap:10px;letter-spacing:.05em;white-space:nowrap`,
    `<span style="color:${RD}">●</span><span style="color:${AM}">●</span><span style="color:${GR}">●</span><span style="margin-left:10px">${title}</span><span style="margin-left:auto;color:${DIM}">[_][□][x]</span>`);
  for (const [l, t_, bx, by] of [[1, 1, 1, 1], [0, 1, -1, 1], [1, 0, 1, -1], [0, 0, -1, -1]])
    div(d, `position:absolute;${l ? 'left' : 'right'}:-10px;${t_ ? 'top' : 'bottom'}:-10px;width:34px;height:34px;border-${l ? 'left' : 'right'}:4px solid ${AM};border-${t_ ? 'top' : 'bottom'}:4px solid ${AM}`);
  d.body = div(d, 'position:absolute;left:0;top:46px;right:0;bottom:0;overflow:hidden');
  return d;
}
function winUpd(d, t, t0) { const k = E.outCubic(P(t, t0, 0.32)); d.style.transform = `scale(${lerp(0.6, 1, k).toFixed(3)},${lerp(0.02, 1, k).toFixed(3)})`; d.style.opacity = t >= t0 ? Math.min(1, k * 3) : 0; }
function headline(parent, y, size, col = WH) { return ab(parent, `left:80px;top:${y}px;width:840px;font-family:Russo;font-size:${size}px;line-height:1.05;color:${col};letter-spacing:.01em;text-shadow:0 0 30px rgba(76,201,240,.25)`); }
function tag(parent, html, col = CY) { return ab(parent, `font-weight:800;font-size:30px;color:${col};border:2px solid ${col};padding:8px 18px;background:rgba(6,10,18,.85);white-space:nowrap;letter-spacing:.04em`, html); }
function pop(el, t, t0, x, y, o = {}) {
  const { s = 1, r = 0, dur = 0.4, t1 = 1e9, ax = 0.5, ay = 0.5 } = o;
  const k = E.outBack(P(t, t0, dur));
  tf(el, { x, y, s: s * (0.4 + 0.6 * k), r, o: t >= t0 && t < t1 ? Math.min(1, P(t, t0, 0.12) * 1.0) : 0, ax, ay });
}

// ---------- сцены ----------
const scenes = [];
function scene(t0, t1, build) { const el = div(stage, ''); el.className = 'sc'; const up = build(el); scenes.push({ t0, t1, el, up }); }
const CUTS = [2.84, 7.44, 12.0, 14.08, 18.24, 22.72, 24.24, 28.4, 32.72];
const END = 36.1;

// ===== HUD сверху (постоянный) =====
const hud = ab(document.getElementById('root'), 'left:0;top:0;width:1920px;height:110px;z-index:40');
const hudL = ab(hud, `left:80px;top:34px;font-weight:800;font-size:28px;letter-spacing:.06em;color:${WH}`);
const hudR = ab(hud, `left:1440px;top:34px;width:400px;text-align:right;font-weight:700;font-size:28px;color:${DIM}`);
const hudFps = ab(hud, `left:620px;top:36px;font-weight:700;font-size:26px;color:${DIM}`);
const hudRam = ab(hud, `left:800px;top:36px;font-weight:700;font-size:26px;color:${DIM}`);
const hudRamBar = ab(hud, `left:980px;top:42px;width:420px;height:22px;border:2px solid rgba(76,201,240,.5)`);
const hudRamFill = div(hudRamBar, `position:absolute;left:2px;top:2px;bottom:2px;width:0;background:${GR}`);
div(hud, 'position:absolute;left:80px;top:96px;width:1760px;height:2px;background:rgba(76,201,240,.35)');
// сколько «памяти» занято — растёт к концу, подводит к теме 256 МБ
const ramAt = (t) => Math.round(lerp(18, 96, E.inOut(P(t, 0, 7.4))) + lerp(0, 150, E.inOut(P(t, 7.9, 3))) * (1 - 0.55 * P(t, 12, 1)) + lerp(0, 160, E.inOut(P(t, 18.2, 17))));
function hudUpd(t) {
  const blink = fr(t * 1.2) < 0.6;
  hudL.innerHTML = `<span style="color:${RD};opacity:${blink ? 1 : 0.25}">●</span> REC&nbsp;&nbsp;<span style="color:${CY}">GTA4_PS3.dbg</span>`;
  const s = Math.floor(t), ff = Math.floor(fr(t) * 30);
  hudR.textContent = `T+00:${String(s).padStart(2, '0')}:${String(ff).padStart(2, '0')}`;
  const stress = t > 9 && t < 12 ? 1 : 0;
  const fps = stress ? Math.round(30 - 12 * P(t, 9, 1.8) + Math.sin(t * 40) * 2) : 30;
  hudFps.innerHTML = `FPS <span style="color:${fps < 25 ? RD : GR}">${String(fps).padStart(2, '0')}</span>`;
  const ram = Math.min(256, ramAt(t));
  hudRam.innerHTML = `RAM <span style="color:${ram > 220 ? RD : ram > 160 ? AM : GR}">${String(ram).padStart(3, '0')}</span>/256`;
  hudRamFill.style.width = `${(ram / 256) * 412}px`;
  hudRamFill.style.background = ram > 220 ? RD : ram > 160 ? AM : GR;
}

// ===== субтитры снизу =====
let WORDS = [], CUES = [];
const sub = ab(document.getElementById('root'), `left:160px;top:925px;width:1600px;height:140px;z-index:40;display:flex;align-items:center;justify-content:center;text-align:center`);
const subIn = div(sub, `font-weight:800;font-size:46px;line-height:1.3;color:${WH};text-shadow:0 4px 0 rgba(0,0,0,.6)`);
let subKey = -1, subSpans = [];
function subUpd(t) {
  const ci = CUES.findIndex((c, i) => t >= c.start - 0.05 && (i + 1 >= CUES.length || t < CUES[i + 1].start - 0.05));
  if (ci < 0 || t > CUES[ci].end + 0.6) { subIn.innerHTML = ''; subKey = -1; return; }
  if (ci !== subKey) {
    subKey = ci; subIn.innerHTML = ''; const c = CUES[ci];
    const ws = WORDS.filter((w) => w.start >= c.start - 0.02 && w.start < c.end - 0.01);
    subSpans = ws.map((w) => { const s = document.createElement('span'); s.textContent = w.word; s.style.cssText = 'padding:0 .12em;margin:0 .04em'; subIn.appendChild(s); subIn.appendChild(document.createTextNode(' ')); return { s, w }; });
    const g = document.createElement('span'); g.textContent = '>'; g.style.cssText = `color:${GR};margin-right:.3em`; subIn.prepend(g);
  }
  for (const { s, w } of subSpans) {
    const on = t >= w.start && t < w.end + 0.08, past = t >= w.end + 0.08;
    s.style.background = on ? GR : 'transparent'; s.style.color = on ? BG : past ? WH : 'rgba(232,241,255,.4)';
  }
}

// ===== глобальные эффекты: глитч на склейках, шум, сканлайны, виньетка =====
div(fx, 'position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,.16) 0 2px,transparent 2px 4px)');
div(fx, 'position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,transparent 55%,rgba(0,0,0,.55) 100%)');
const noiseURLs = [0, 1, 2, 3].map((k) => { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); const d = g.createImageData(256, 256);
  for (let i = 0; i < d.data.length; i += 4) { const v = rnd(i, k + 1) * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 22; } g.putImageData(d, 0, 0); return c.toDataURL(); });
const noise = div(fx, 'position:absolute;inset:0;mix-blend-mode:overlay');
const bars = Array.from({ length: 7 }, () => ab(fx, 'width:1920px;opacity:0'));
const flash = div(fx, 'position:absolute;inset:0;background:#bfefff;opacity:0');
function fxUpd(t, f) {
  noise.style.background = `url(${noiseURLs[f % 4]})`;
  let g = 0;
  for (const c of CUTS) { const d = t - c; if (d > -0.1 && d < 0.16) g = Math.max(g, 1 - Math.abs(d - 0.02) / 0.14); }
  const i0 = Math.floor(t * 30);
  bars.forEach((b, i) => {
    if (g <= 0) { b.style.opacity = 0; return; }
    const y = rnd(i0, i + 3) * 1080, h = 10 + rnd(i0, i + 7) * 90;
    b.style.cssText = `position:absolute;left:0;top:0;width:1920px;height:${h}px;transform:translate(${(rnd(i0, i + 11) - 0.5) * 120}px,${y}px);background:${i % 3 === 0 ? 'rgba(255,59,78,.35)' : i % 3 === 1 ? 'rgba(76,201,240,.35)' : 'rgba(232,241,255,.18)'};opacity:${g}`;
  });
  stage.style.filter = g > 0 ? `drop-shadow(${(8 * g).toFixed(1)}px 0 0 rgba(255,59,78,.7)) drop-shadow(${(-8 * g).toFixed(1)}px 0 0 rgba(76,201,240,.7))` : 'none';
  stage.style.transform = g > 0 ? `translateX(${((rnd(i0, 5) - 0.5) * 30 * g).toFixed(1)}px)` : 'none';
  flash.style.opacity = g > 0.6 ? (g - 0.6) * 0.5 : 0;
}

// ================= S1 · загрузка PS3 (0 – 2.84) =================
scene(0, 2.84, (sc) => {
  const title = typer(sc, `left:80px;top:150px;font-weight:800;font-size:96px;color:${WH};letter-spacing:.02em`, [['PLAYSTATION', null], [' 3', CY]]);
  const lw = win(sc, 80, 300, 840, 300, 'BOOT.log');
  const lines = [
    [0.15, [['> CELL BE   3.2 GHz ', null], ['....... ', DIM], ['OK', GR]]],
    [0.55, [['> RSX GPU   550 MHz ', null], ['....... ', DIM], ['OK', GR]]],
    [0.95, [['> XDR RAM   256 MB  ', null], ['....... ', DIM], ['OK', GR]]],
    [1.35, [['> VRAM      256 MB  ', null], ['....... ', DIM], ['OK', GR]]],
    [1.75, [['> BLU-RAY   2x      ', null], ['....... ', DIM], ['OK', GR]]],
  ].map(([t0, segs], i) => ({ t0, d: typer(lw.body, `left:28px;top:${18 + i * 44}px;font-size:31px;font-weight:700;white-space:pre;color:${WH}`, segs) }));
  const glow = ab(sc, 'width:1000px;height:1000px;border-radius:50%;background:radial-gradient(circle,rgba(76,201,240,.30),transparent 62%)');
  const ps = img(sc, '/gta4_ps3/assets/ps3_fat.png', 'height:780px');
  const dimV = ab(sc, `left:0;top:0;width:3px;height:780px;background:${CY}`);
  const dimVt = ab(sc, `font-size:26px;font-weight:700;color:${CY};white-space:nowrap`, '325 мм');
  const year = tag(sc, 'SONY · 2006', AM);
  const star = tag(sc, '★ ЛЕГЕНДА', GR);
  return (t) => {
    typeUpd(title, t, 0.0, 22);
    winUpd(lw, t, 0.05); lines.forEach((l) => typeUpd(l.d, t, l.t0, 70, false));
    const k = E.outCubic(P(t, 0.2, 0.6));
    tf(glow, { x: 1420, y: 520, o: k }); tf(ps, { x: 1420, y: lerp(1250, 520, k), ax: 0.5, ay: 0.5, s: 1, o: t >= 0.2 ? 1 : 0 });
    const kd = E.outCubic(P(t, 0.8, 0.5));
    tf(dimV, { x: 1130, y: 520, sy: kd, ax: 0.5, ay: 0.5, o: kd > 0 ? 1 : 0 }); tf(dimVt, { x: 1090, y: 520, r: -90, o: kd });
    pop(year, t, 0.88, 1770, 200);
    pop(star, t, 1.2, 240, 720, { r: -4, s: 1.4 });
  };
});

// ================= S2 · Cell Broadband Engine (2.84 – 7.44) =================
scene(2.84, 7.44, (sc) => {
  const h1 = headline(sc, 150, 92);
  const ww = win(sc, 960, 130, 880, 770, 'CELL_BROADBAND_ENGINE.sch');
  const S = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(S, 'svg'); svg.setAttribute('width', 876); svg.setAttribute('height', 724); svg.setAttribute('viewBox', '30 20 900 800'); svg.style.cssText = 'position:absolute;left:0;top:0'; ww.body.appendChild(svg);
  const mk = (tagn, a) => { const e = document.createElementNS(S, tagn); for (const k in a) e.setAttribute(k, a[k]); svg.appendChild(e); return e; };
  const die = mk('rect', { x: 58, y: 40, width: 840, height: 760, fill: 'rgba(76,201,240,.04)', stroke: CY, 'stroke-width': 4 });
  const dieLen = 2 * (840 + 760); die.style.strokeDasharray = dieLen;
  const blk = (x, y, w, h, lab, sub_, col) => { const g = document.createElementNS(S, 'g'); svg.appendChild(g);
    const r = document.createElementNS(S, 'rect'); Object.entries({ x, y, width: w, height: h, fill: col + '22', stroke: col, 'stroke-width': 3 }).forEach(([k, v]) => r.setAttribute(k, v)); g.appendChild(r);
    const tx = document.createElementNS(S, 'text'); Object.entries({ x: x + w / 2, y: y + h / 2 - (sub_ ? 6 : -10), fill: col, 'font-size': 34, 'font-weight': 800, 'text-anchor': 'middle', 'font-family': 'JB' }).forEach(([k, v]) => tx.setAttribute(k, v)); tx.textContent = lab; g.appendChild(tx);
    if (sub_) { const t2 = document.createElementNS(S, 'text'); Object.entries({ x: x + w / 2, y: y + h / 2 + 30, fill: WH, 'font-size': 22, 'font-weight': 700, 'text-anchor': 'middle', 'font-family': 'JB', opacity: 0.7 }).forEach(([k, v]) => t2.setAttribute(k, v)); t2.textContent = sub_; g.appendChild(t2); }
    g.r = r; g.cx = x + w / 2; g.cy = y + h / 2; return g; };
  const ppe = blk(90, 80, 300, 300, 'PPE', '3.2 GHz · PowerPC', AM);
  const l2 = blk(90, 400, 300, 120, 'L2', '512 KB', AM);
  const mic = blk(90, 650, 300, 120, 'XDR MIC', '→ 256 MB', CY);
  const io = blk(560, 690, 300, 80, 'FlexIO', '', CY);
  const spes = [];
  for (let i = 0; i < 8; i++) { const c = i % 2, r = Math.floor(i / 2); spes.push(blk(470 + c * 210, 80 + r * 150, 190, 130, `SPE${i}`, i === 7 ? 'OFF (брак)' : i === 6 ? 'OS' : '256 KB', i === 7 ? DIM : GR)); }
  // шина EIB — кольцо, по которому бегут пакеты данных
  const eibPts = [[430, 60], [430, 620], [880, 620], [880, 660], [420, 660], [420, 560], [60 + 360, 560]];
  const eib = mk('rect', { x: 420, y: 60, width: 460, height: 580, rx: 18, fill: 'none', stroke: 'rgba(255,176,0,.5)', 'stroke-width': 3, 'stroke-dasharray': '10 8' });
  const eibLab = mk('text', { x: 650, y: 682, fill: AM, 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', 'font-family': 'JB' }); eibLab.textContent = 'EIB · кольцевая шина';
  const packets = Array.from({ length: 14 }, () => mk('rect', { width: 16, height: 16, fill: GR }));
  const perim = 2 * (460 + 580);
  const ptOn = (u) => { u = ((u % perim) + perim) % perim; if (u < 460) return [420 + u, 60]; u -= 460; if (u < 580) return [880, 60 + u]; u -= 580; if (u < 460) return [880 - u, 640]; u -= 460; return [420, 640 - u]; };
  const gf = ab(sc, `left:80px;top:560px;width:840px;font-weight:800;font-size:100px;color:${GR}`);
  const chip1 = tag(sc, '1 × PPE', AM), chip2 = tag(sc, '8 × SPE', GR);
  return (t) => {
    const w1 = t >= 4.0 ? 'CELL' : '', w2 = t >= 4.32 ? ' BROADBAND' : '', w3 = t >= 4.88 ? ' ENGINE' : '';
    h1.innerHTML = `<span style="color:${AM}">${w1}</span>${w2}<br><span style="color:${CY}">${w3}</span>`; h1.style.opacity = 1;
    if (t < 4.0) { h1.innerHTML = `<span style="color:${DIM}">ПРОЦЕССОР_</span>`; }
    winUpd(ww, t, 2.86);
    die.style.strokeDashoffset = dieLen * (1 - E.inOut(P(t, 2.95, 0.6)));
    const show = (g, t0) => { const k = E.outBack(P(t, t0, 0.35)); g.setAttribute('opacity', t >= t0 ? 1 : 0); g.setAttribute('transform', `translate(${g.cx},${g.cy}) scale(${0.5 + 0.5 * k}) translate(${-g.cx},${-g.cy})`); };
    show(ppe, 3.36); show(l2, 3.5); show(mic, 3.62); show(io, 3.7);
    spes.forEach((g, i) => { show(g, 3.75 + i * 0.08); const pulse = t > 5.5 && i < 7 ? 0.25 + 0.25 * (0.5 + 0.5 * Math.sin(t * 9 + i)) : 0.13; g.r.setAttribute('fill', (i === 7 ? DIM : GR) + Math.round(pulse * 255).toString(16).padStart(2, '0')); });
    eib.setAttribute('opacity', P(t, 3.9, 0.3)); eibLab.setAttribute('opacity', P(t, 3.9, 0.3));
    const sp = t < 5.5 ? (t - 3.9) * 220 : (5.5 - 3.9) * 220 + (t - 5.5) * 900;
    packets.forEach((p, i) => { const [x, y] = ptOn(sp + (i * perim) / packets.length); p.setAttribute('x', x - 8); p.setAttribute('y', y - 8); p.setAttribute('opacity', t >= 3.9 ? 1 : 0); p.setAttribute('fill', i % 3 ? GR : AM); });
    const g = Math.round(200 * E.outCubic(P(t, 5.52, 1.4)));
    gf.innerHTML = t >= 5.52 ? `≈ ${g}<br><span style="font-size:40px;color:${WH}">GFLOPS · вычислений в секунду ×10⁹</span>` : ''; gf.style.opacity = t >= 5.52 ? 1 : 0;
    pop(chip1, t, 3.36, 180, 470); pop(chip2, t, 3.75, 430, 470);
  };
});

// ================= S3 · игры выжимают максимум (7.44 – 12.0) =================
scene(7.44, 12.0, (sc) => {
  const h = typer(sc, `left:80px;top:150px;font-weight:800;font-size:64px;color:${WH}`, [['> STRESS_TEST', null], ['.exe', DIM]]);
  const games = ['GTA IV', 'UNCHARTED 3', 'THE LAST OF US', 'GTA V'].map((n, i) => tag(sc, n, i === 0 ? AM : CY));
  const ww = win(sc, 900, 130, 940, 720, 'HW_MONITOR');
  const rows = [['CPU · CELL', 0], ['GPU · RSX', 0.25], ['RAM · XDR', 0.5], ['VRAM · GDDR3', 0.75]].map(([lab, d], i) => {
    const y = 30 + i * 160;
    const l = ab(ww.body, `left:36px;top:${y}px;font-weight:800;font-size:34px;color:${WH}`, lab);
    const pct = ab(ww.body, `left:700px;top:${y}px;width:200px;text-align:right;font-weight:800;font-size:40px;color:${GR}`);
    const segs = Array.from({ length: 20 }, (_, k) => ab(ww.body, `left:${36 + k * 44}px;top:${y + 58}px;width:36px;height:62px;background:rgba(93,107,130,.25)`));
    return { l, pct, segs, d };
  });
  const warn = ab(sc, `left:80px;top:560px;width:760px;padding:22px 0;text-align:center;font-weight:800;font-size:50px;color:${BG};background:${RD}`, '⚠ HARDWARE LIMIT');
  return (t) => {
    typeUpd(h, t, 7.44, 30);
    games.forEach((g, i) => pop(g, t, 7.92 + i * 0.12, [180, 470, 240, 560][i], [300, 300, 390, 390][i], { s: 1.05 }));
    winUpd(ww, t, 8.0);
    rows.forEach((r) => {
      const v = clamp(E.inOut(P(t, 8.3 + r.d * 0.4, 10.88 - 8.3 - r.d * 0.4)) + (t > 10.88 ? 0 : 0.02 * Math.sin(t * 13 + r.d * 9)));
      const pct = Math.round(v * 100);
      r.pct.textContent = pct + '%'; r.pct.style.color = pct >= 95 ? RD : pct > 70 ? AM : GR;
      r.segs.forEach((s, k) => { const on = k < Math.round(v * 20); s.style.background = on ? (k >= 17 ? RD : k >= 12 ? AM : GR) : 'rgba(93,107,130,.25)'; });
    });
    const on = t >= 10.88; warn.style.opacity = on ? (fr(t * 3) < 0.6 ? 1 : 0.35) : 0;
    const sh = on ? Math.exp(-(t - 10.88) * 4) * 14 : 0;
    sc.style.transform = `translate(${(Math.sin(t * 71) * sh).toFixed(1)}px,${(Math.cos(t * 53) * sh).toFixed(1)}px)`;
  };
});

// ================= S4 · «Начнём с GTA 4» (12.0 – 14.08) =================
scene(12.0, 14.08, (sc) => {
  const cmd = typer(sc, `left:80px;top:150px;font-weight:800;font-size:52px;color:${WH}`, [['> LOAD ', null], ['GTA4.self', AM]]);
  const rings = [380, 310].map((r, i) => ab(sc, `width:${r * 2}px;height:${r * 2}px;border-radius:50%;border:${i ? 3 : 4}px ${i ? 'solid' : 'dashed'} rgba(76,201,240,${i ? 0.35 : 0.55})`));
  const logos = [RD, CY, null].map((c) => { const i = img(sc, '/gta4_ps3/assets/gta4_logo.png', 'width:680px'); if (c) i.style.filter = `drop-shadow(0 0 0 ${c}) opacity(.6)`; return i; });
  logos[0].style.filter = 'brightness(.5) sepia(1) hue-rotate(-50deg) saturate(6) opacity(.75)';
  logos[1].style.filter = 'brightness(.6) sepia(1) hue-rotate(150deg) saturate(6) opacity(.75)';
  const info = typer(sc, `left:0;top:0;font-weight:700;font-size:34px;color:${CY};white-space:nowrap`, [['ROCKSTAR NORTH ', null], ['· ', DIM], ['2008', AM]]);
  return (t) => {
    typeUpd(cmd, t, 12.0, 30);
    rings.forEach((r, i) => tf(r, { x: 960, y: 500, r: (i ? -1 : 1) * t * 25, s: E.outCubic(P(t, 12.4 + i * 0.1, 0.5)), o: P(t, 12.4, 0.2) }));
    const k = E.outBack(P(t, 12.72, 0.45));
    const gl = Math.exp(-Math.max(0, t - 12.72) * 5);
    const i0 = Math.floor(t * 30);
    logos.forEach((l, i) => {
      const off = i === 2 ? 0 : (i ? -1 : 1) * (6 + 30 * gl) + (rnd(i0, i) - 0.5) * 30 * gl;
      tf(l, { x: 960 + off, y: 500 + (i === 2 ? 0 : (rnd(i0, i + 4) - 0.5) * 20 * gl), s: 0.5 + 0.5 * k, o: t >= 12.72 ? (i === 2 ? 1 : 0.5 + 0.5 * gl) : 0 });
    });
    typeUpd(info, t, 13.1, 34); tf(info, { x: 1560, y: 840, o: t >= 13.1 ? 1 : 0 });
  };
});

// ================= S5 · GTA 4 работает на PS3 (14.08 – 18.24) =================
scene(14.08, 18.24, (sc) => {
  const ww = win(sc, 80, 130, 1000, 770, 'CAPTURE · PS3 · GTA4');
  const fr0 = img(ww.body, '', 'width:996px;height:724px;object-fit:cover');
  const rec = ab(ww.body, `left:24px;top:20px;font-weight:800;font-size:28px;color:${WH};background:rgba(0,0,0,.55);padding:4px 12px`);
  let cur = -1;
  const st = [
    [15.2, [['GAME     ', DIM], ['GTA IV', AM]]],
    [15.92, [['STATUS   ', DIM], ['RUNNING ✓', GR]]],
    [16.56, [['PLATFORM ', DIM], ['PLAYSTATION 3', CY]]],
  ].map(([t0, segs], i) => ({ t0, d: typer(sc, `left:1150px;top:${200 + i * 80}px;font-weight:800;font-size:42px;white-space:pre`, segs) }));
  const stamp = ab(sc, `font-family:Russo;font-size:96px;color:${AM};border:6px solid ${AM};padding:6px 34px;white-space:nowrap;background:rgba(6,10,18,.85)`, 'ВПЕЧАТЛЯЕТ');
  return (t) => {
    winUpd(ww, t, 14.1);
    const k = clamp(Math.floor((t - 14.08) * 15) + 1, 1, 65); // 0.5× скорость
    if (k !== cur) { cur = k; fr0.src = `/gta4_ps3/clips/ps3_gameplay_run/${String(k).padStart(4, '0')}.jpg`; pend.push(fr0.decode().catch(() => {})); }
    rec.innerHTML = `<span style="color:${RD};opacity:${fr(t * 1.5) < 0.6 ? 1 : 0.2}">●</span> LIVE · PS3`;
    st.forEach((s) => typeUpd(s.d, t, s.t0, 40, false));
    pop(stamp, t, 17.08, 1480, 620, { r: -5, dur: 0.35 });
  };
});

// ================= 3D: общий рендерер =================
const R3 = { w: 1076, h: 724 };
const canvas = document.createElement('canvas'); canvas.width = R3.w; canvas.height = R3.h; canvas.style.cssText = 'position:absolute;left:0;top:0;width:1076px;height:724px';
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(R3.w, R3.h, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const cam3 = new THREE.PerspectiveCamera(45, R3.w / R3.h, 0.1, 400);
const edgeMat = new THREE.LineBasicMaterial({ color: 0x4cc9f0, transparent: true, opacity: 0.75 });

// --- город Liberty City (три острова) ---
const city = new THREE.Scene(); city.background = new THREE.Color(0x060a12); city.fog = new THREE.Fog(0x060a12, 120, 260);
city.add(new THREE.GridHelper(160, 80, 0x1d4a5e, 0x0f2536));
const isl = [
  { x0: -6, x1: 6, z0: -30, z1: 28, hmul: 2.4 },    // Algonquin
  { x0: 11, x1: 36, z0: -22, z1: 24, hmul: 0.9 },   // Broker / Dukes
  { x0: -36, x1: -11, z0: -26, z1: 20, hmul: 1.0 }, // Alderney
];
const bGeos = [], eGeos = [], bList = [];
let bi = 0;
for (const I of isl) for (let x = I.x0; x < I.x1; x += 2.4) for (let z = I.z0; z < I.z1; z += 2.4) {
  bi++; if (rnd(bi, 1) < 0.12) continue;
  const dc = Math.hypot(x / 10, z / 30);
  const h = (0.6 + rnd(bi, 2) * 2.4 + (I.hmul > 2 ? Math.max(0, 1 - dc) * 10 * rnd(bi, 3) : 0)) * I.hmul;
  const w = 1.4 + rnd(bi, 4) * 0.6, d = 1.4 + rnd(bi, 5) * 0.6;
  const g = new THREE.BoxGeometry(w, h, d); g.translate(x, h / 2, z); bGeos.push(g); eGeos.push(new THREE.EdgesGeometry(g)); bList.push({ x, z, h });
}
const cityMesh = new THREE.Mesh(mergeGeometries(bGeos), new THREE.MeshBasicMaterial({ color: 0x0b1828 }));
const cityEdges = new THREE.LineSegments(mergeGeometries(eGeos), edgeMat);
city.add(cityMesh, cityEdges);
// квадрат «16 км²»
const sqPts = []; const SQ = 38; const corners = [[-SQ, -SQ], [SQ, -SQ], [SQ, SQ], [-SQ, SQ], [-SQ, -SQ]];
for (let c = 0; c < 4; c++) for (let k = 0; k < 100; k++) { const a = corners[c], b = corners[c + 1]; sqPts.push(new THREE.Vector3(lerp(a[0], b[0], k / 100), 0.2, lerp(a[1], b[1], k / 100))); }
sqPts.push(new THREE.Vector3(-SQ, 0.2, -SQ));
const sqLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(sqPts), new THREE.LineBasicMaterial({ color: 0xffb000, fog: false }));
city.add(sqLine);
const scanPlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 40), new THREE.MeshBasicMaterial({ color: 0x39ff88, transparent: true, opacity: 0.12, side: THREE.DoubleSide }));
scanPlane.scale.set(1, 1, 1); scanPlane.rotation.y = Math.PI / 2; scanPlane.scale.x = 90; city.add(scanPlane);
const scanLine = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 90), new THREE.MeshBasicMaterial({ color: 0x39ff88 })); city.add(scanLine);

function cityUpd(t) {
  const u = t - 18.24;
  const a = 0.5 + u * 0.13, rad = lerp(95, 62, E.inOut(P(u, 0, 4.4))), hh = lerp(85, 38, E.inOut(P(u, 0, 4.4)));
  cam3.position.set(Math.sin(a) * rad, hh, Math.cos(a) * rad); cam3.lookAt(0, 0, 0); cam3.fov = 45; cam3.updateProjectionMatrix();
  const k = E.inOut(P(t, 18.68, 0.9)); sqLine.geometry.setDrawRange(0, Math.max(0, Math.floor(k * sqPts.length)));
  const sp = P(t, 20.64, 1.4); const sx = lerp(-45, 45, sp); scanPlane.position.set(sx, 20, 0); scanLine.position.set(sx, 0.2, 0);
  scanPlane.visible = scanLine.visible = sp > 0 && sp < 1;
  edgeMat.color.set(sp > 0 && sp < 1 ? 0x6fe3ff : 0x4cc9f0);
  renderer.render(city, cam3);
}

// --- авария: машина в столб ---
const crash = new THREE.Scene(); crash.background = new THREE.Color(0x060a12);
crash.add(new THREE.GridHelper(40, 40, 0x1d4a5e, 0x0f2536));
crash.add(new THREE.HemisphereLight(0x9fdcff, 0x101820, 1.2));
const dl = new THREE.DirectionalLight(0xffffff, 2.2); dl.position.set(4, 8, 6); crash.add(dl);
const car = new THREE.Group(); crash.add(car);
const carParts = [];
function carPart(w, h, d, sx, sy, sz, y, x, col) {
  const g = new THREE.BoxGeometry(w, h, d, sx, sy, sz); g.translate(x, y, 0);
  const base = g.attributes.position.array.slice();
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: col, roughness: 0.45, metalness: 0.35, flatShading: true }));
  const wf = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0x4cc9f0, wireframe: true, transparent: true, opacity: 0.14 }));
  car.add(m, wf); carParts.push({ g, base });
}
carPart(4.4, 0.9, 2.0, 28, 4, 10, 0.75, 0, 0xc8352b);
carPart(2.3, 0.75, 1.8, 14, 4, 8, 1.6, -0.35, 0xa52a22);
const wheelG = new THREE.CylinderGeometry(0.42, 0.42, 0.3, 20); wheelG.rotateX(Math.PI / 2);
for (const [x, z] of [[1.4, 1.0], [1.4, -1.0], [-1.4, 1.0], [-1.4, -1.0]]) { const w = new THREE.Mesh(wheelG, new THREE.MeshStandardMaterial({ color: 0x111111 })); w.position.set(x, 0.42, z); car.add(w); }
const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 6, 16), new THREE.MeshStandardMaterial({ color: 0x8a96a8, metalness: 0.6, roughness: 0.4 }));
pole.geometry.translate(0, 3, 0); crash.add(pole);
const sparkG = new THREE.BufferGeometry(); const NS = 60; sparkG.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NS * 3), 3));
const sparks = new THREE.Points(sparkG, new THREE.PointsMaterial({ color: 0xffb000, size: 0.12 })); crash.add(sparks);
const TI = 23.3, XI = -0.18 - 2.2;
function crashUpd(t) {
  const v = 11; let cx, pen;
  if (t < TI) { cx = XI - v * (TI - t); pen = 0; } else { const k = E.outCubic(P(t, TI, 0.22)); cx = XI + 1.25 * k - 0.15 * E.inOut(P(t, TI + 0.25, 0.4)); pen = 1.25 * k; }
  car.position.x = cx;
  for (const { g, base } of carParts) {
    const pa = g.attributes.position.array;
    for (let i = 0; i < pa.length; i += 3) {
      const lx = base[i], ly = base[i + 1], lz = base[i + 2];
      const infl = Math.pow(clamp((lx - (2.2 - 2.4)) / 2.4), 1.6);
      const depth = pen * Math.max(0, 1 - Math.pow(lz / 1.05, 2)) + pen * 0.25;
      pa[i] = lx - depth * infl;
      pa[i + 1] = ly + Math.sin(lx * 7 + lz * 3) * 0.07 * pen * infl;
      pa[i + 2] = lz * (1 + 0.06 * pen * infl);
    }
    g.attributes.position.needsUpdate = true; g.computeVertexNormals();
  }
  pole.rotation.z = -0.1 * E.outCubic(P(t, TI, 0.3));
  const sa = sparkG.attributes.position.array, tau = t - TI;
  for (let i = 0; i < NS; i++) {
    const vx = -1 + rnd(i, 1) * 5, vy = 1 + rnd(i, 2) * 4, vz = (rnd(i, 3) - 0.5) * 6;
    sa[i * 3] = -0.2 + vx * tau; sa[i * 3 + 1] = 1 + vy * tau - 4.9 * tau * tau; sa[i * 3 + 2] = vz * tau;
  }
  sparkG.attributes.position.needsUpdate = true; sparks.visible = tau > 0 && tau < 0.9;
  const u = t - 22.72;
  cam3.position.set(2.4 + u * 0.35, 2.3, 6.0 - u * 0.4); cam3.lookAt(-0.7, 0.8, 0); cam3.fov = 42; cam3.updateProjectionMatrix();
  renderer.render(crash, cam3);
}

// --- тени от солнца в реальном времени ---
const sun = new THREE.Scene(); sun.background = new THREE.Color(0x070d18);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ color: 0x6a7a90, roughness: 0.95 }));
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; sun.add(ground);
const g2 = new THREE.GridHelper(80, 40, 0x2b5b70, 0x22384a); g2.position.y = 0.01; sun.add(g2);
const bmat = new THREE.MeshStandardMaterial({ color: 0x8b98ab, roughness: 0.8 });
let k2 = 0;
for (let x = -14; x <= 14; x += 4.6) for (let z = -14; z <= 10; z += 4.6) {
  k2++; if (rnd(k2, 9) < 0.15) continue;
  const h = 1.5 + rnd(k2, 8) * 7 + (Math.abs(x) < 5 && Math.abs(z) < 5 ? 6 : 0);
  const m = new THREE.Mesh(new THREE.BoxGeometry(2.8, h, 2.8), bmat); m.position.set(x, h / 2, z); m.castShadow = m.receiveShadow = true; sun.add(m);
  const e = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry), new THREE.LineBasicMaterial({ color: 0x4cc9f0, transparent: true, opacity: 0.5 })); e.position.copy(m.position); sun.add(e);
}
const amb = new THREE.HemisphereLight(0x8fb8ff, 0x1a1a22, 0.22); sun.add(amb);
const sl = new THREE.DirectionalLight(0xffffff, 3); sl.castShadow = true; sl.shadow.mapSize.set(2048, 2048);
Object.assign(sl.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 140 }); sl.shadow.bias = -0.0008; sun.add(sl, sl.target);
const sunBall = new THREE.Mesh(new THREE.SphereGeometry(2.2, 24, 16), new THREE.MeshBasicMaterial({ color: 0xffc04d })); sun.add(sunBall);
const sunP = (t) => P(t, 28.4, 32.72 - 28.4);
function sunUpd(t) {
  const p = sunP(t), ph = lerp(0.12, Math.PI - 0.12, p);
  const dir = new THREE.Vector3(Math.cos(ph) * 52, Math.sin(ph) * 30 + 4, -22);
  sl.position.copy(dir); sl.target.position.set(0, 0, 0);
  const low = 1 - Math.sin(ph);
  sl.color.setRGB(1, lerp(0.95, 0.55, low), lerp(0.9, 0.3, low)); sl.intensity = lerp(3.2, 2.2, low);
  sunBall.position.copy(dir.clone().multiplyScalar(1.3)); sunBall.material.color.setRGB(1, lerp(0.85, 0.55, low), lerp(0.5, 0.2, low));
  const u = t - 28.4;
  cam3.position.set(Math.sin(0.25 + u * 0.05) * 42, 30, Math.cos(0.25 + u * 0.05) * 42); cam3.lookAt(0, 2, -4); cam3.fov = 40; cam3.updateProjectionMatrix();
  renderer.render(sun, cam3);
}

// ================= S6 · Liberty City 16 км² (18.24 – 22.72) =================
scene(18.24, 22.72, (sc) => {
  const h = typer(sc, `left:80px;top:150px;font-family:Russo;font-size:84px;line-height:1.05;color:${WH};white-space:pre`, [['LIBERTY\n', null], ['CITY', AM]]);
  const sz = typer(sc, `left:80px;top:360px;font-weight:800;font-size:40px;white-space:pre`, [['SIZE    ', DIM], ['≈ 4 × 4 KM', AM]]);
  const ww = win(sc, 760, 130, 1080, 770, 'WORLD_MAP · 3D');
  const holder = div(ww.body, 'position:absolute;inset:0');
  const big = ab(ww.body, `font-weight:800;font-size:120px;color:${AM};text-shadow:0 0 24px rgba(255,176,0,.5);white-space:nowrap`);
  const lab = ab(ww.body, `left:24px;top:20px;font-weight:700;font-size:26px;color:${CY};background:rgba(6,10,18,.7);padding:6px 12px`, 'ALGONQUIN · BROKER · ALDERNEY');
  const scan = typer(sc, `left:80px;top:430px;font-weight:800;font-size:40px;white-space:pre`, [['DETAIL_SCAN ', DIM], ['████████ ', GR], ['100%', GR]]);
  return (t) => {
    typeUpd(h, t, 18.24, 30);
    winUpd(ww, t, 18.26);
    if (canvas.parentNode !== holder) holder.appendChild(canvas);
    cityUpd(t);
    const n = Math.round(16 * E.outCubic(P(t, 18.68, 0.9)));
    big.innerHTML = `${n} КМ<span style="font-size:70px;vertical-align:super">2</span>`; pop(big, t, 18.68, 538, 600, { dur: 0.35 });
    lab.style.opacity = P(t, 18.6, 0.3);
    typeUpd(scan, t, 20.64, 22, false); typeUpd(sz, t, 18.68, 30, false);
  };
});

// ================= S7 · деформация машин (22.72 – 24.24) =================
scene(22.72, 24.24, (sc) => {
  const h = typer(sc, `left:80px;top:150px;font-family:Russo;font-size:76px;color:${WH}`, [['ДЕФОРМАЦИЯ', RD]]);
  const ww = win(sc, 760, 130, 1080, 770, 'PHYSICS · SOFT_BODY');
  const holder = div(ww.body, 'position:absolute;inset:0');
  const log = ab(sc, `left:80px;top:290px;font-weight:800;font-size:40px;line-height:1.5;white-space:pre;color:${WH}`);
  return (t) => {
    typeUpd(h, t, 22.72, 30);
    winUpd(ww, t, 22.74);
    if (canvas.parentNode !== holder) holder.appendChild(canvas);
    crashUpd(t);
    const imp = t >= TI;
    log.innerHTML = imp ? `IMPACT   <span style="color:${RD}">92 км/ч</span>\nMESH     <span style="color:${AM}">DEFORM ✓</span>` : `SPEED    <span style="color:${GR}">${Math.round(lerp(60, 92, P(t, 22.72, TI - 22.72)))} км/ч</span>`;
  };
});

// ================= S8 · прохожие с «нервной системой» (24.24 – 28.4) =================
scene(24.24, 28.4, (sc) => {
  const h = typer(sc, `left:80px;top:150px;font-family:Russo;font-size:60px;line-height:1.1;color:${WH}`, [['НЕРВНАЯ СИСТЕМА', GR], ['\n', null]]);
  h.style.whiteSpace = 'pre';
  const sub_ = typer(sc, `left:80px;top:235px;font-weight:700;font-size:34px;color:${DIM}`, [['NaturalMotion ', null], ['EUPHORIA', AM]]);
  const ww = win(sc, 760, 130, 1080, 770, 'NPC_BRAIN · ragdoll + мышцы');
  const S = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(S, 'svg'); svg.setAttribute('width', 1076); svg.setAttribute('height', 724); svg.setAttribute('viewBox', '0 140 956 700'); svg.style.cssText = 'position:absolute;left:0;top:0;overflow:visible'; ww.body.appendChild(svg);
  const mk = (tagn, a, par = svg) => { const e = document.createElementNS(S, tagn); for (const k in a) e.setAttribute(k, a[k]); par.appendChild(e); return e; };
  const GY = 800;
  mk('line', { x1: -300, y1: GY, x2: 1300, y2: GY, stroke: CY, 'stroke-width': 3, opacity: 0.6 });
  for (let x = -300; x < 1300; x += 40) mk('line', { x1: x, y1: GY, x2: x - 20, y2: GY + 20, stroke: CY, 'stroke-width': 2, opacity: 0.3 });
  // машина-«толкатель»
  const carG = mk('g', {});
  mk('rect', { x: -330, y: GY - 150, width: 330, height: 100, rx: 18, fill: 'rgba(255,59,78,.18)', stroke: RD, 'stroke-width': 4 }, carG);
  mk('rect', { x: -260, y: GY - 215, width: 170, height: 70, rx: 14, fill: 'rgba(255,59,78,.12)', stroke: RD, 'stroke-width': 4 }, carG);
  for (const x of [-260, -70]) mk('circle', { cx: x, cy: GY - 45, r: 40, fill: BG, stroke: RD, 'stroke-width': 4 }, carG);
  // три «призрака» позы (onion skin) + основная
  const figs = [0.24, 0.12, 0].map((lag) => {
    const g = mk('g', { opacity: lag ? 0.18 : 1 });
    const L = (w, c, o = 1) => mk('line', { stroke: c, 'stroke-width': w, 'stroke-linecap': 'round', opacity: o }, g);
    const f = { lag, g, bones: Array.from({ length: 10 }, () => L(14, WH)), musc: lag ? [] : Array.from({ length: 6 }, () => L(26, RD, 0.5)), joints: [], head: mk('circle', { r: 40, fill: 'none', stroke: WH, 'stroke-width': 10 }, g) };
    if (!lag) { f.musc.forEach((m) => g.insertBefore(m, g.firstChild)); f.joints = Array.from({ length: 11 }, () => mk('circle', { r: 11, fill: AM }, g)); }
    return f;
  });
  const neurons = Array.from({ length: 18 }, () => mk('circle', { r: 8, fill: GR }));
  const bal = ab(sc, `left:80px;top:330px;font-weight:800;font-size:34px;line-height:1.5;color:${WH};white-space:pre`);
  const st = ab(sc, `left:80px;top:470px;width:640px;font-weight:800;font-size:36px;line-height:1.35`);
  const TH = 25.35, X0 = 470;
  const ik = (hx, hy, fx, fy, l1, l2) => { const dx = fx - hx, dy = fy - hy; const d = Math.min(Math.hypot(dx, dy), l1 + l2 - 0.01); const a = Math.atan2(dy, dx); const b = Math.acos((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)); return [hx + Math.cos(a - b) * l1, hy + Math.sin(a - b) * l1]; };
  const stepX = (tau, t0, t1, from, to) => lerp(from, to, E.inOut(P(tau, t0, t1 - t0)));
  const lift = (tau, t0, t1) => (tau > t0 && tau < t1 ? Math.sin(Math.PI * (tau - t0) / (t1 - t0)) * 70 : 0);
  function pose(t) {
    const tau = t - TH, hit = tau > 0;
    const push = hit ? 170 * (1 - Math.exp(-2.6 * tau)) : 0;
    const wob = hit ? 26 * Math.exp(-1.5 * tau) * Math.sin(7 * tau) : 0;
    let lean = hit ? -0.7 * Math.exp(-1.9 * tau) * Math.cos(5.2 * tau) : 0.03 * Math.sin(t * 2);
    const fl = stepX(tau, 0.45, 0.8, X0 - 55, X0 + 115) , frx = tau < 0.75 ? stepX(tau, 0.12, 0.45, X0 + 55, X0 + 175) : stepX(tau, 0.75, 1.05, X0 + 175, X0 + 225);
    const fly = GY - lift(tau, 0.45, 0.8), fry = GY - lift(tau, 0.12, 0.45) - lift(tau, 0.75, 1.05);
    const px = X0 + push + wob, py = GY - 225 + (hit ? 18 * Math.exp(-2 * tau) * Math.abs(Math.sin(4 * tau)) : 0);
    const chx = px + Math.sin(lean) * 200, chy = py - Math.cos(lean) * 200;
    const hx = chx + Math.sin(lean * 1.3) * 62, hy = chy - Math.cos(lean * 1.3) * 62;
    const kl = ik(px - 14, py, fl, fly, 118, 118), kr = ik(px + 14, py, frx, fry, 118, 118);
    // knee forward (+x): ik bends to one side; flip if needed
    const fixK = (k, hx_, hy_, fx_, fy_) => { const mx = (hx_ + fx_) / 2, my = (hy_ + fy_) / 2; return k[0] < mx ? [2 * mx - k[0] + 0, k[1]] : k; };
    const KL = fixK(kl, px - 14, py, fl, fly), KR = fixK(kr, px + 14, py, frx, fry);
    const flail = hit ? Math.exp(-1.5 * tau) : 0;
    const arm = (side, ph) => { const a1 = Math.PI / 2 + side * 0.25 + lean + flail * 1.6 * Math.sin(9 * tau + ph) - side * flail * 0.9; const ex = chx + Math.cos(a1) * 105, ey = chy + 10 + Math.sin(a1) * 105;
      const a2 = a1 - side * (0.35 + flail * 0.8 * Math.sin(8 * tau + ph)); return [[ex, ey], [ex + Math.cos(a2) * 100, ey + Math.sin(a2) * 100]]; };
    const [EL, HL] = arm(1, 0), [ER, HR] = arm(-1, 1.7);
    return { px, py, chx, chy, hx, hy, KL, KR, fl, fly, frx, fry, EL, HL, ER, HR, act: hit ? 0.3 + 0.7 * Math.exp(-1.0 * tau) * Math.abs(Math.sin(10 * tau)) : 0.15, lean };
  }
  const setL = (l, a, b) => { l.setAttribute('x1', a[0]); l.setAttribute('y1', a[1]); l.setAttribute('x2', b[0]); l.setAttribute('y2', b[1]); };
  return (t) => {
    typeUpd(h, t, 24.24, 24, false); typeUpd(sub_, t, 24.5, 40, false);
    winUpd(ww, t, 24.26);
    const tau = t - TH;
    const cx = tau < 0 ? lerp(-120, X0 - 70, E.inCubic(P(t, 24.6, TH - 24.6))) : X0 - 70 + 60 * E.outCubic(P(tau, 0, 0.5));
    carG.setAttribute('transform', `translate(${cx},0)`); carG.setAttribute('opacity', t >= 24.6 ? 1 : 0);
    for (const f of figs) {
      const p = pose(t - f.lag); const sh = (a) => a;
      const segs = [[[p.px, p.py], [p.chx, p.chy]], [[p.chx, p.chy], [p.hx, p.hy]], [[p.px - 14, p.py], p.KL], [p.KL, [p.fl, p.fly]], [[p.px + 14, p.py], p.KR], [p.KR, [p.frx, p.fry]],
        [[p.chx, p.chy + 10], p.EL], [p.EL, p.HL], [[p.chx, p.chy + 10], p.ER], [p.ER, p.HR]];
      segs.forEach((s, i) => setL(f.bones[i], sh(s[0]), sh(s[1])));
      f.head.setAttribute('cx', p.hx + Math.sin(p.lean) * 30); f.head.setAttribute('cy', p.hy - Math.cos(p.lean) * 30);
      if (!f.lag) {
        [2, 3, 4, 5, 6, 8].forEach((si, i) => { setL(f.musc[i], segs[si][0], segs[si][1]); f.musc[i].setAttribute('opacity', (0.2 + 0.7 * p.act * (0.6 + 0.4 * Math.sin(t * 20 + i))).toFixed(2)); });
        [[p.px, p.py], [p.chx, p.chy], p.KL, p.KR, [p.fl, p.fly], [p.frx, p.fry], p.EL, p.ER, p.HL, p.HR, [p.chx, p.chy + 10]].forEach((q, i) => { f.joints[i].setAttribute('cx', q[0]); f.joints[i].setAttribute('cy', q[1]); });
        neurons.forEach((n, i) => {
          const path = [[p.hx, p.hy], [p.chx, p.chy], [p.px, p.py], i % 2 ? p.KL : p.KR, i % 2 ? [p.fl, p.fly] : [p.frx, p.fry]];
          const u = fr(t * 0.9 + i / neurons.length) * 4, k = Math.floor(u), r = u - k;
          n.setAttribute('cx', lerp(path[k][0], path[k + 1][0], r)); n.setAttribute('cy', lerp(path[k][1], path[k + 1][1], r)); n.setAttribute('opacity', t >= 24.93 ? 0.9 : 0);
        });
        const b = Math.round(100 * (1 - Math.min(1, Math.abs(p.lean) / 0.7)));
        bal.innerHTML = `BALANCE  <span style="color:${b < 50 ? RD : b < 85 ? AM : GR}">${'█'.repeat(Math.round(b / 10))}${'░'.repeat(10 - Math.round(b / 10))} ${String(b).padStart(3)}%</span>\nMUSCLES  <span style="color:${p.act > 0.4 ? RD : GR}">${p.act > 0.4 ? 'ACTIVE' : 'IDLE'}</span>`;
      }
      f.g.setAttribute('opacity', f.lag ? (tau > 0 && tau < 1.6 ? 0.16 : 0) : 1);
    }
    st.innerHTML = t >= 27.32 ? `<span style="color:${GR}">✓ РАВНОВЕСИЕ<br>ВОССТАНОВЛЕНО —<br>как живой человек</span>` : t >= TH ? `<span style="color:${AM}">⚠ УДАР →<br>ловит равновесие…</span>` : `<span style="color:${DIM}">НИКАКИХ ГОТОВЫХ<br>АНИМАЦИЙ</span>`;
  };
});

// ================= S9 · тени в реальном времени (28.4 – 32.72) =================
scene(28.4, 32.72, (sc) => {
  const h = typer(sc, `left:80px;top:150px;font-family:Russo;font-size:76px;line-height:1.08;color:${WH};white-space:pre`, [['ТЕНИ В\n', null], ['РЕАЛЬНОМ\n', AM], ['ВРЕМЕНИ', null]]);
  const ww = win(sc, 760, 130, 1080, 770, 'LIGHTING · TIME_OF_DAY');
  const holder = div(ww.body, 'position:absolute;inset:0');
  const clock = ab(ww.body, `left:24px;top:20px;font-weight:800;font-size:40px;color:${AM};background:rgba(6,10,18,.75);padding:6px 14px`);
  const S = 'http://www.w3.org/2000/svg';
  const arc = ab(sc, 'left:80px;top:500px;width:620px;height:130px');
  arc.innerHTML = `<svg width="620" height="130" viewBox="0 0 960 200"><path d="M60 180 A420 160 0 0 1 900 180" fill="none" stroke="${DIM}" stroke-width="4" stroke-dasharray="10 10"/><line x1="40" y1="182" x2="920" y2="182" stroke="${CY}" stroke-width="3"/><circle id="sd" r="22" fill="${AM}"/></svg>`;
  const sd = arc.querySelector('#sd');
  return (t) => {
    typeUpd(h, t, 28.4, 34);
    winUpd(ww, t, 28.42);
    if (canvas.parentNode !== holder) holder.appendChild(canvas);
    sunUpd(t);
    const p = sunP(t), hr = 7 + p * 12, hh = Math.floor(hr), mm = Math.floor((hr - hh) * 60 / 5) * 5;
    clock.textContent = `☀ ${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    const ph = lerp(Math.PI, 0, p); sd.setAttribute('cx', 480 + Math.cos(ph) * 420); sd.setAttribute('cy', 180 - Math.sin(ph) * 160);
  };
});

// ================= S10 · «на консоли 2006 года» (32.72 – END) =================
scene(32.72, END, (sc) => {
  const h = typer(sc, `left:1000px;top:220px;font-weight:800;font-size:52px;color:${WH}`, [['> И ВСЁ ЭТО НА КОНСОЛИ', null]]);
  const ps = img(sc, '/gta4_ps3/assets/ps3_fat.png', 'height:740px');
  const glow = ab(sc, 'width:1000px;height:1000px;border-radius:50%;background:radial-gradient(circle,rgba(76,201,240,.30),transparent 62%)');
  sc.insertBefore(glow, ps);
  const digs = [2, 0, 0, 6].map((d, i) => {
    const box = ab(sc, `width:200px;height:250px;overflow:hidden;border:3px solid ${AM};background:rgba(6,10,18,.9)`);
    const strip = div(box, `position:absolute;left:0;top:0;width:200px;font-weight:800;font-size:200px;line-height:250px;text-align:center;color:${AM}`, Array.from({ length: 30 }, (_, k) => (k % 10)).join('<br>'));
    return { box, strip, d, i };
  });
  const chip = tag(sc, 'CELL · 256 MB RAM · 256 MB VRAM', CY);
  return (t) => {
    typeUpd(h, t, 32.72, 30);
    const k = E.outCubic(P(t, 32.75, 0.5));
    tf(glow, { x: 560, y: 520, s: 0.8 + 0.05 * Math.sin(t * 3) });
    tf(ps, { x: 560, y: lerp(550, 520, k), s: lerp(0.85, 1, k), o: k });
    digs.forEach((g) => {
      tf(g.box, { x: 1100 + g.i * 212, y: 500, s: E.outBack(P(t, 33.2 + g.i * 0.05, 0.35)), o: t >= 33.2 ? 1 : 0 });
      const stop = 34.16 + g.i * 0.08, p = E.outCubic(P(t, 33.3, stop - 33.3));
      const final = 20 + g.d; const pos = lerp(0, final, p);
      g.strip.style.transform = `translateY(${(-pos * 250).toFixed(1)}px)`;
    });
    const land = t >= 34.5; digs.forEach((g) => (g.box.style.boxShadow = land ? `0 0 ${40 * Math.exp(-(t - 34.5) * 3)}px ${AM}` : 'none'));
    pop(chip, t, 34.7, 1418, 730);
  };
});

// ---------- главный цикл ----------
window.renderAt = async (t) => {
  pend.length = 0;
  const f = Math.round(t * 30);
  for (const s of scenes) { const on = t >= s.t0 && t < s.t1; s.el.style.display = on ? 'block' : 'none'; if (on) s.up(t); }
  hudUpd(t); subUpd(t); fxUpd(t, f);
  await Promise.all(pend);
};
window.DUR = END;
(async () => {
  const j = await (await fetch('/gta4_ps3/timing.json')).json();
  WORDS = j.words; CUES = j.cues;
  await document.fonts.load('800 40px JB'); await document.fonts.load('700 40px JB'); await document.fonts.load('40px Russo'); await document.fonts.load('800 40px JB', 'Привет'); await document.fonts.load('40px Russo', 'Привет');
  await Promise.all([...document.images].filter((i) => i.src).map((i) => i.decode().catch(() => {})));
  window.__ready = true;
})();
