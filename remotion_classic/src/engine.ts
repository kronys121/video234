// Математика движка v2, перенесённая один в один: появление, камера, тайминг по словам.
import WORDS from './words.json';

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const P = (t: number, a: number, d: number) => clamp((t - a) / d);
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const E = {
  outCubic: (x: number) => 1 - Math.pow(1 - x, 3),
  inOut: (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  inOutQuint: (x: number) => (x < 0.5 ? 16 * x ** 5 : 1 - Math.pow(-2 * x + 2, 5) / 2),
};
export const outExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
export const fr = (x: number) => x - Math.floor(x);
export const rnd = (i: number, k = 0) => fr(Math.sin(i * 127.1 + k * 311.7) * 43758.5453);
export const INK = '#2a2a2c', RED = '#e3262b';

// ---- слова озвучки ----
const nz = (s: string) => s.toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9]/g, '');
export const at = (p: string, after = 0, k = 0) => {
  const q = nz(p); let n = 0;
  for (const x of WORDS as { w: string; t: number }[]) if (x.t >= after - 0.001 && nz(x.w).startsWith(q)) { if (n++ === k) return x.t; }
  throw new Error(`слово «${p}» не найдено после ${after}`);
};
// элемент не должен появиться в самом конце сцены и сразу исчезнуть: держим минимум HOLD сек
export const HOLD = 2.0;
export const wordAt = (t0: number, next: number) => (p: string, k = 0) => Math.min(at(p, t0, k), Math.max(t0 + 0.35, next - HOLD));

// ---- трансформ элемента ----
export const tf = ({ x = 0, y = 0, s = 1, r = 0, rx = 0, ry = 0 }) =>
  `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-50%) perspective(1600px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotate(${r.toFixed(2)}deg) scale(${s.toFixed(4)})`;

export type PopOpts = { from?: [number, number]; s?: number; r?: number; dur?: number; r0?: number; t1?: number; out?: number; float?: number };
// появление: плавный выезд издалека, размытие в движении, 3D-разворот, который успокаивается
export function popIn(t: number, t0: number, x: number, y: number, o: PopOpts = {}) {
  const { s = 1, r = 0, dur = 0.85, r0 = 0, t1 = 1e9, out = 0.45, float = 0 } = o;
  let [fx, fy] = o.from || [0, 180];
  if (fx === 0 && fy === 0) { /* на месте */ }
  else if (fx === 0) { if (x < -180) { fx = -640; fy *= 0.4; } else if (x > 180) { fx = 640; fy *= 0.4; } else fy = Math.max(fy, 60) * 2.6; }
  else { fx *= 2.4; fy *= 2.4; }
  const p = outExpo(P(t, t0, dur)), q = 1 - p;
  const gone = t >= t1 ? E.inOut(P(t, t1, out)) : 0;
  const fl = float ? Math.sin((t - t0) * 1.3 + x * 0.01) * float * 0.8 : 0;
  const dir = Math.sign(fx) || 0;
  const sway = Math.sin((t - t0) * 0.7 + x * 0.003) * 3;
  const bl = t >= t0 ? Math.max(q * q * 14, gone * 8) : 0;
  return {
    transform: tf({ x: x + fx * q + dir * gone * 260, y: y + fy * q + fl - gone * 40, s: s * (0.9 + 0.1 * p) * (1 - 0.08 * gone), r: lerp(r0 + dir * 4, r, p),
      rx: (fy > 0 ? 14 : fy < 0 ? -14 : 0) * q, ry: -dir * 28 * q + sway }),
    opacity: t >= t0 ? Math.min(1, P(t, t0, 0.22)) * (1 - gone) : 0,
    blur: bl > 0.3 ? bl : 0,
  };
}

// ---- камера ----
export type Cam = { z?: number; tr?: number; keys?: [number, number, number, number, number][] };
export type BeatPos = { t0: number; cx: number; cy: number; cam: Cam; i: number };
export const beatPos = (i: number) => ({ cx: i * 2500, cy: [0, 260, -200, 180, -260, 90][i % 6] });

export function makeCamera(beats: BeatPos[]) {
  const K: number[][] = [[0, 0, beats[0].cx - 40, beats[0].cy + 10, 0.86, 0]];
  beats.forEach((b) => {
    const side = b.i % 2 ? 1 : -1;
    if (b.i > 0) K.push([b.t0, b.cam.tr ?? 0.5, b.cx, b.cy, b.cam.z ?? 1, side]);
    (b.cam.keys || []).forEach(([t, d, x, y, z]) => K.push([t, d, b.cx + x, b.cy + y, z, side]));
  });
  K.sort((a, b) => a[0] - b[0]);
  K.splice(1, 0, [0.0, 1.6, beats[0].cx, beats[0].cy, 1.0, -1]);
  return (t: number) => {
    let c = K[0].slice(2);
    for (let i = 1; i < K.length; i++) {
      const [t0, d, x, y, z, r] = K[i];
      if (t < t0) break;
      const k = d > 0 ? E.inOutQuint(P(t, t0, d)) : 1;
      c = [lerp(c[0], x, k), lerp(c[1], y, k), lerp(c[2], z, k), lerp(c[3], r, k)];
    }
    let cur = 0; beats.forEach((b, i) => { if (t >= b.t0) cur = i; });
    const cb = beats[cur], pb = beats[cur - 1], V = 22, Z = 0.016;
    const dirOf = (b: BeatPos) => (b.i % 2 ? 1 : -1);
    const kTr = E.inOutQuint(P(t, cb.t0, cb.cam.tr ?? 0.5));
    const loc = t - cb.t0, pl = pb ? cb.t0 - pb.t0 : 0;
    const sat = (u: number) => 110 * (1 - Math.exp(-u * V / 110));
    const dx = dirOf(cb) * sat(loc) + (pb ? dirOf(pb) * sat(pl) * (1 - kTr) : 0);
    const dzRaw = Z * loc * kTr + (pb ? Z * pl * (1 - kTr) : 0);
    const dz = 0.14 * (1 - Math.exp(-dzRaw / 0.14));
    return { x: c[0] + dx / c[2] + Math.sin(t * 0.55) * 10, y: c[1] + Math.cos(t * 0.43) * 8, z: c[2] * 0.93 * (1 + dz), r: c[3] * 0.8 + Math.sin(t * 0.32) * 0.4 };
  };
}
