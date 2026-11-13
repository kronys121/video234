// Движок v3 — монтаж «как в референсе»: один холст на группу сцен, плавные панорамы камеры,
// растворение между группами, «фокус» (объект поверх размытой сцены), влёт объектов снизу с доворотом.
import WORDS from './words.json';

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const P = (t: number, a: number, d: number) => clamp((t - a) / d);
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const inOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const outCubic = (x: number) => 1 - Math.pow(1 - x, 3);
export const outQuint = (x: number) => 1 - Math.pow(1 - x, 5);
export const INK = '#1d1d20', RED = '#e3262b';

// ---- слова озвучки ----
const nz = (s: string) => s.toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9]/g, '');
export const at = (p: string, after = 0, k = 0) => {
  const q = nz(p); let n = 0;
  for (const x of WORDS as { w: string; t: number }[]) if (x.t >= after - 0.001 && nz(x.w).startsWith(q)) { if (n++ === k) return x.t; }
  throw new Error(`слово «${p}» не найдено после ${after}`);
};

// ---- тайминги монтажа (сняты с референса покадрово) ----
export const T = {
  dissolve: 0.45, // растворение между группами сцен
  pan: 1.0,       // панорама камеры к соседней сцене
  focus: 0.5,     // размытие сцены под «фокусным» объектом
  enter: 0.55,    // влёт объекта
  hold: 2.0,      // объект живёт на экране минимум столько
};

// влёт объекта: снизу-слева, с доворотом и лёгким увеличением, без отскока
export function enter(t: number, t0: number, o: { from?: [number, number]; rot?: number; dur?: number } = {}) {
  const [fx, fy] = o.from || [-140, 300];
  const p = outQuint(P(t, t0, o.dur ?? T.enter)), q = 1 - p;
  return { dx: fx * q, dy: fy * q, rot: (o.rot ?? -16) * q, scale: 0.86 + 0.14 * p, opacity: t >= t0 ? P(t, t0, 0.14) : 0 };
}
