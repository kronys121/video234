// Пилот: первые ~31 сек TLOU2 (та же озвучка, те же сцены), собранные на Remotion.
import React from 'react';
import { AbsoluteFill, Audio, Img, staticFile } from 'remotion';
import { E, P, beatPos, makeCamera, wordAt, Cam, BeatPos, RED } from './engine';
import { useT, BeatCtx, Card, Prop, Emo, Cap, BigNum, Plate, Arrow } from './components';

export const PILOT_SEC = 31.1;
type W = (p: string, k?: number) => number;
type Beat = { t0: number; bg: string | null; cam?: Cam; body: (t: number, w: W) => React.ReactNode };

const FONT = `
@font-face{font-family:'Osw';font-weight:700;src:url('${staticFile('fonts/osw-cyr.woff2')}') format('woff2');unicode-range:U+0400-045F}
@font-face{font-family:'Osw';font-weight:700;src:url('${staticFile('fonts/osw-lat.woff2')}') format('woff2');unicode-range:U+0000-00FF,U+2000-206F}`;

// ---------- сцены ----------
const BEATS: Beat[] = [
  { t0: 0.0, bg: 'clips/t_forest/0120.jpg', cam: { keys: [[0, 2.6, 0, 0, 1.06]] }, body: (t, w) => <>
    <Card src="cover_ps4.jpg" w={400} h={505} at={t + 0.15} x={-520} y={30} r={-4} />
    <Prop src="logo_white.png" h={230} at={w('last')} x={240} y={-80} float={3} filter="drop-shadow(0 10px 25px rgba(0,0,0,.7))" />
    <Cap text="НА PS4" size={110} at={w('ps4')} x={240} y={150} cps={20} col="#fff" r={0} />
  </> },
  { t0: 4.24, bg: null, cam: { z: 0.92 }, body: (t, w) => <>
    <Card clip="city1" n={240} w={640} at={w('живые')} x={-560} y={-190} r={-2} />
    <Card clip="enemy1" n={240} w={640} at={w('враги')} x={300} y={-200} r={2} />
    <Card clip="dogsniff" n={240} w={620} at={w('собаки')} x={-380} y={230} r={-2} />
    <Emo ch="🔊" size={140} at={w('звук')} x={520} y={230} />
  </> },
  { t0: 10.05, bg: 'img/blue.jpg', body: (t, w) => <>
    <Prop src="ps4.png" h={330} at={t + 0.1} x={-320} y={80} />
    <BigNum n="7 ЛЕТ" sub="консоли к выходу игры" col={RED} at={w('семь')} x={420} y={20} />
  </> },
  { t0: 13.59, bg: null, body: (t, w) => <>
    <Card src="cover_ps4.jpg" w={360} h={455} at={t + 0.1} x={-500} y={20} r={-3} />
    <Cap text="ЧЕРЕЗ НЕСКОЛЬКО МЕСЯЦЕВ" size={70} at={w('несколько')} x={260} y={-260} />
    <Prop src="ps5.png" h={520} at={w('ps5')} x={360} y={60} />
  </> },
  { t0: 18.27, bg: 'img/pcb.jpg', cam: { keys: [[18.27, 2.0, 0, 0, 1.08]] }, body: (t, w) => <>
    <Cap text="ПОЧЕМУ НЕ НА PS5?" size={140} at={w('почему')} x={0} y={0} cps={40} r={0} col="#fff" shadow="0 10px 30px rgba(0,0,0,.6)" />
    <Prop src="nd_logo.png" h={110} at={w('naughty')} x={0} y={230} float={3} filter="drop-shadow(0 20px 30px rgba(0,0,0,.35))" />
  </> },
  { t0: 21.38, bg: null, body: (t, w) => <>
    <Cap text="2014" size={220} at={w('четырнадцатом') - 0.3} x={-380} y={-40} cps={10} r={-3} />
    <Arrow at={w('году')} x={60} y={-40} />
    <Cap text="2020" size={220} at={w('тогда')} x={460} y={-40} cps={10} r={3} col={RED} />
    <Plate text="6 ЛЕТ РАЗРАБОТКИ" col="#fff" bg="#2a2a2c" at={w('шесть')} x={40} y={250} />
  </> },
];
const END = [...BEATS.slice(1).map((b) => b.t0), 31.08]; // конец каждой сцены (31.08 — следующая сцена в полном ролике)
const POS: BeatPos[] = BEATS.map((b, i) => ({ i, t0: b.t0, cam: b.cam || {}, ...beatPos(i) }));
const camAt = makeCamera(POS);

export const Pilot: React.FC = () => {
  const t = useT();
  const c = camAt(t);
  let cur = 0; BEATS.forEach((b, i) => { if (t >= b.t0) cur = i; });
  // размытие в движении камеры (по скорости между соседними кадрами)
  const c0 = camAt(t - 1 / 60), c1 = camAt(t + 1 / 60), zf = Math.abs(c1.z - c0.z) / c.z * 250;
  const bx = Math.min(26, Math.abs(c1.x - c0.x) * c.z * 0.22 + zf), by = Math.min(26, Math.abs(c1.y - c0.y) * c.z * 0.22 + zf);
  const cb = BEATS[cur], pb = BEATS[cur - 1], k = E.inOut(P(t, cb.t0, 0.5));
  const layer = (b: Beat, op: number, x: number, s: number, z: number) => b.bg && (
    <div style={{ position: 'absolute', inset: -60, zIndex: z, opacity: op, transform: `translateX(${x.toFixed(1)}px) scale(${s.toFixed(4)})`, filter: 'blur(9px) brightness(.5) saturate(.8)' }}>
      <Img src={staticFile(b.bg)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  );
  return (
    <AbsoluteFill style={{ background: '#e6e6e8', overflow: 'hidden' }}>
      <style>{FONT}</style>
      <svg width={0} height={0} style={{ position: 'absolute' }}><filter id="mb" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB"><feGaussianBlur stdDeviation={`${bx.toFixed(2)} ${by.toFixed(2)}`} edgeMode="duplicate" /></filter></svg>
      <AbsoluteFill style={{ filter: bx + by > 0.6 ? 'url(#mb)' : undefined }}>
        <div style={{ position: 'absolute', inset: -40, background: '#f7f7f8' }} />
        <AbsoluteFill>
          {pb && layer(pb, cb.bg ? 1 : 1 - k, -80 * k, 1.04, 1)}
          {layer(cb, k, 80 * (1 - k) - (t - cb.t0) * 6, 1.04 + (t - cb.t0) * 0.006, 2)}
        </AbsoluteFill>
        <div style={{ position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', zIndex: 3,
          transform: `translate(960px,540px) perspective(2400px) rotateX(${(Math.sin(t * 0.21) * 5).toFixed(3)}deg) rotateY(${(Math.cos(t * 0.17) * 7).toFixed(3)}deg) rotate(${c.r.toFixed(3)}deg) scale(${c.z.toFixed(4)}) translate(${(-c.x).toFixed(1)}px,${(-c.y).toFixed(1)}px)` }}>
          {BEATS.map((b, i) => Math.abs(i - cur) <= 1 && (
            <div key={i} style={{ position: 'absolute', left: POS[i].cx, top: POS[i].cy, width: 0, height: 0 }}>
              <BeatCtx.Provider value={{ end: END[i], dark: !!b.bg }}>{b.body(b.t0, wordAt(b.t0, END[i]))}</BeatCtx.Provider>
            </div>
          ))}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 72% 68% at 50% 50%,rgba(0,0,0,0) 45%,rgba(0,0,0,.42) 100%)' }} />
      <Audio src={staticFile('voice.wav')} />
    </AbsoluteFill>
  );
};
