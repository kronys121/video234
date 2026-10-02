import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { loadFonts } from './lib/text3d.js';
import { checkOverlaps } from './lib/overlap.js';
import { clamp, inv, easeInCubic, easeOutCubic } from './lib/util.js';
const PROJ = new URLSearchParams(location.search).get('p') || '1';
let SHOTS = [], CHUNKS = [];

const W = 1080, H = 1920, FPS = 30;
const out = document.getElementById('out');
const ox = out.getContext('2d');

let renderer, composer, renderPass, bloom, gtao, words, chunks, envTex;
const built = new Map();

async function init() {
  await Promise.all([document.fonts.load('900 80px Mont', 'АБВabc'), document.fonts.load('80px Russo', 'АБВabc')]);
  await loadFonts();
  const mod = await import(PROJ === '1' ? './scenes/index.js' : `./scenes${PROJ}/index.js`);
  SHOTS = mod.SHOTS; CHUNKS = mod.CHUNKS;
  words = (await (await fetch(PROJ === '1' ? '/src_words.json' : `/src_words${PROJ}.json`)).json()).words;
  chunks = makeChunks(words);
  renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(1);
  renderer.setSize(W, H);
  renderer.domElement.id = 'gl';
  document.body.appendChild(renderer.domElement);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer);
  envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
  composer = new EffectComposer(renderer, rt);
  renderPass = new RenderPass(new THREE.Scene(), new THREE.PerspectiveCamera());
  bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.35, 0.45, 0.88);
  // ambient occlusion (opt-in per shot via inst.ao); sprites, transparent planes and noAO objects stay out of the G-buffer
  gtao = new GTAOPass(new THREE.Scene(), new THREE.PerspectiveCamera(), W, H);
  gtao.overrideVisibility = function () { const cache = this._visibilityCache; this.scene.traverse((o) => { cache.set(o, o.visible); if (o.isPoints || o.isLine || o.isSprite || o.userData.noAO || (o.material && !Array.isArray(o.material) && o.material.transparent)) o.visible = false; }); };
  gtao.enabled = false;
  composer.addPass(renderPass); composer.addPass(gtao); composer.addPass(bloom); composer.addPass(new OutputPass());
  return { duration: SHOTS[SHOTS.length - 1].end, shots: SHOTS.map((s) => [s.id, s.start, s.end, s.trans]) };
}

function getShot(i) {
  if (!built.has(i)) {
    const s = SHOTS[i];
    const inst = s.build({ THREE, renderer, envTex, W, H });
    if (!inst.scene.environment) inst.scene.environment = envTex;
    inst.scene.environmentIntensity = inst.envIntensity ?? 0.35;
    built.set(i, inst);
  }
  return built.get(i);
}

// render shot i at global time t with an optional extra yaw (whip) and exposure boost
function renderShot(i, t, { yaw = 0, pitch = 0, exposure = 1 } = {}) {
  const s = SHOTS[i];
  const inst = getShot(i);
  const lt = t - s.start;
  inst.update(lt, t);
  const cam = inst.camera;
  if (yaw) cam.rotateY(yaw);
  if (pitch) cam.rotateX(pitch);
  renderer.toneMappingExposure = (inst.exposure || 1) * exposure;
  bloom.strength = inst.bloom ?? 0.35;
  bloom.threshold = inst.bloomThreshold ?? 0.88;
  renderPass.scene = inst.scene; renderPass.camera = cam;
  gtao.enabled = !!inst.ao;
  if (inst.ao) { gtao.scene = inst.scene; gtao.camera = cam; gtao.blendIntensity = inst.ao; if (!inst._aoSet) { gtao.updateGtaoMaterial({ radius: inst.aoRadius ?? 0.35, distanceExponent: 1, thickness: 1, scale: 1, samples: 16 }); gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 16 }); } }
  composer.render();
  return renderer.domElement;
}

const WHIP = 0.16; // seconds each side of a whip cut
function whipYaw(t) {
  // returns [shotIndex, yaw] for whip transitions around t
  for (let i = 1; i < SHOTS.length; i++) {
    const s = SHOTS[i]; if (s.trans !== 'whip') continue;
    const dir = s.whipDir || 1;
    if (t >= s.start - WHIP && t < s.start) return { i: i - 1, yaw: dir * easeInCubic(inv(s.start - WHIP, s.start, t)) * 1.1 };
    if (t >= s.start && t < s.start + WHIP) return { i, yaw: -dir * (1 - easeOutCubic(inv(s.start, s.start + WHIP, t))) * 1.1 };
  }
  return null;
}

function shotAt(t) {
  for (let i = SHOTS.length - 1; i >= 0; i--) if (t >= SHOTS[i].start) return i;
  return 0;
}

function drawFrame(t) {
  const i = shotAt(t);
  const s = SHOTS[i];
  const w = whipYaw(t);
  ox.globalAlpha = 1; ox.globalCompositeOperation = 'source-over';
  if (w) {
    // motion blur: accumulate sub-frames across the shutter
    const N = 6;
    for (let k = 0; k < N; k++) {
      const tt = t + (k / (N - 1) - 0.5) / FPS;
      const ww = whipYaw(tt) || { i: shotAt(tt), yaw: 0 };
      const c = renderShot(ww.i, tt, { yaw: ww.yaw });
      ox.globalAlpha = 1 / (k + 1);
      ox.drawImage(c, 0, 0);
    }
    ox.globalAlpha = 1;
  } else if (s.trans === 'split' && t < s.start + 1.0 && i > 0) {
    // diagonal split screen: new shot slides in from right, holds half, then takes over
    const lt = t - s.start;
    const cPrev = renderShot(i - 1, t);
    ox.drawImage(cPrev, 0, 0);
    const k = lt < 0.22 ? easeOutCubic(lt / 0.22) * 0.5 : lt < 0.78 ? 0.5 : 0.5 + easeInCubic((lt - 0.78) / 0.22) * 0.5;
    const cNew = renderShot(i, t);
    // xm = x of the divider at mid-height; region right of it shows the new shot
    const slope = 380;
    const xm = k <= 0.5 ? W + slope - (W / 2 + slope) * (k / 0.5) : W / 2 - (W / 2 + slope + 10) * ((k - 0.5) / 0.5);
    ox.save();
    ox.beginPath(); ox.moveTo(xm + slope, 0); ox.lineTo(W + 10, 0); ox.lineTo(W + 10, H); ox.lineTo(xm - slope, H); ox.closePath();
    ox.clip(); ox.drawImage(cNew, 0, 0); ox.restore();
    ox.strokeStyle = '#ffffff'; ox.lineWidth = 12; ox.beginPath(); ox.moveTo(xm + slope, -10); ox.lineTo(xm - slope, H + 10); ox.stroke();
  } else {
    let exposure = 1;
    if (s.trans === 'flash') exposure = 1 + 2.5 * Math.max(0, 1 - (t - s.start) / 0.3);
    const next = SHOTS[i + 1];
    if (next && next.trans === 'flash' && t > next.start - 0.1) exposure = 1 + 3 * inv(next.start - 0.1, next.start, t);
    ox.drawImage(renderShot(i, t, { exposure }), 0, 0);
  }
  // flash overlay
  if (s.trans === 'flash') {
    const a = Math.max(0, 1 - (t - s.start) / 0.28);
    if (a > 0) { ox.fillStyle = `rgba(255,248,235,${(a * a * 0.95).toFixed(3)})`; ox.fillRect(0, 0, W, H); }
  }
  vignette();
  subtitles(t);
}

let vig;
function vignette() {
  if (!vig) {
    vig = document.createElement('canvas'); vig.width = W; vig.height = H;
    const g = vig.getContext('2d');
    const gr = g.createRadialGradient(W / 2, H * 0.47, H * 0.28, W / 2, H * 0.47, H * 0.68);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.5)');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
  }
  ox.drawImage(vig, 0, 0);
}

// ---------- subtitles ----------
// 2–3 word groups come from the project's scenes/index.js (must match the narration word order)
function makeChunks(ws) {
  const res = []; let k = 0;
  for (const c of CHUNKS) {
    const n = c.split(' ').length;
    const grp = ws.slice(k, k + n);
    if (grp.map((w) => w.w).join(' ') !== c) throw new Error('chunk mismatch: ' + c + ' vs ' + grp.map((w) => w.w).join(' '));
    res.push(grp); k += n;
  }
  if (CHUNKS.length && k !== ws.length) throw new Error('unused words ' + k + '/' + ws.length);
  return res.map((c, i) => ({ words: c, s: c[0].s, e: res[i + 1] ? Math.min(res[i + 1][0].s, c[c.length - 1].e + 0.6) : 99 }));
}
const fmt = (w) => w.replace(/^"/, '«').replace(/"(?=[.,]?$)/, '»').replace(/[,.]$/, '').replace(/[,.]»$/, '»').replace(/»\.$/, '»');

function subtitles(t) {
  const c = chunks.find((ch) => t >= ch.s - 0.02 && t < ch.e);
  if (!c) return;
  const size0 = 86;
  const items = c.words.map((w) => ({ txt: fmt(w.w), active: t >= w.s && t < (w.e + 0.02) }));
  if (!items.some((x) => x.active)) { const lastPast = [...c.words].reverse().findIndex((w) => t >= w.s); if (lastPast >= 0) items[items.length - 1 - lastPast].active = true; }
  ox.font = `900 ${size0}px Mont`;
  const space = size0 * 0.34;
  let widths = items.map((x) => ox.measureText(x.txt).width);
  let total = widths.reduce((a, b) => a + b, 0) + space * (items.length - 1);
  let size = size0;
  if (total > W - 120) { size = size0 * (W - 120) / total; ox.font = `900 ${size}px Mont`; widths = items.map((x) => ox.measureText(x.txt).width); total = widths.reduce((a, b) => a + b, 0) + space * size / size0 * (items.length - 1); }
  const appear = clamp((t - c.s) / 0.12);
  const sc = 0.82 + 0.18 * easeOutCubic(appear) + Math.sin(appear * Math.PI) * 0.06;
  const cy = H * 0.745;
  ox.save();
  ox.translate(W / 2, cy); ox.scale(sc, sc);
  const ACT = 1.06;
  const ew = widths.map((wv, k) => wv * (items[k].active ? ACT : 1));
  const tot2 = ew.reduce((a, b) => a + b, 0) + space * size / size0 * (items.length - 1);
  let x = -tot2 / 2;
  ox.textBaseline = 'middle'; ox.lineJoin = 'round'; ox.miterLimit = 2;
  items.forEach((it, k) => {
    const wv = ew[k];
    ox.save();
    ox.translate(x + wv / 2, 0);
    if (it.active) ox.scale(ACT, ACT);
    ox.textAlign = 'center';
    ox.shadowColor = 'rgba(0,0,0,0.55)'; ox.shadowBlur = 18; ox.shadowOffsetY = 6;
    ox.strokeStyle = '#000'; ox.lineWidth = size * 0.2; ox.strokeText(it.txt, 0, 0);
    ox.shadowColor = 'transparent';
    ox.fillStyle = it.active ? '#FFD21F' : '#FFFFFF';
    ox.fillText(it.txt, 0, 0);
    ox.restore();
    x += wv + space * size / size0;
  });
  ox.restore();
}

window.__init = init;
window.__frame = (f, quality = 0.95) => { drawFrame(f / FPS); return out.toDataURL('image/jpeg', quality); };
window.__time = (t, quality = 0.95) => { drawFrame(t); return out.toDataURL('image/jpeg', quality); };
window.__chunks = () => chunks.map((c) => [c.s.toFixed(2), c.e.toFixed(2), c.words.map((w) => w.w).join(' ')]);
window.__overlaps = (t) => { const i = shotAt(t); const inst = getShot(i); inst.update(t - SHOTS[i].start, t); inst.scene.updateMatrixWorld(true); return [SHOTS[i].id, checkOverlaps(inst.scene)]; };
window.__ready = true;
