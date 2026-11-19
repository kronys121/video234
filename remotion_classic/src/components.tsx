// Элементы сцены: карточки с клипами, предметы, печатающиеся подписи, плашки.
import React, { createContext, useContext } from 'react';
import { Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { INK, RED, P, E, outExpo, rnd, tf, popIn, PopOpts, fr } from './engine';

export const useT = () => { const f = useCurrentFrame(); const { fps } = useVideoConfig(); return f / fps; };
export const BeatCtx = createContext({ end: 1e9, dark: false });
const SH = 'drop-shadow(0 30px 30px rgba(0,0,0,.32))';
const abs: React.CSSProperties = { position: 'absolute', left: 0, top: 0 };

type Base = { at: number; x: number; y: number; z?: number } & PopOpts;

// обёртка: любой контент с анимацией появления
export const Pop: React.FC<Base & { filter?: string; style?: React.CSSProperties; children: React.ReactNode }> = ({ at, x, y, z, filter = SH, style, children, ...o }) => {
  const t = useT(); const p = popIn(t, at, x, y, o);
  return <div style={{ ...abs, transform: p.transform, opacity: p.opacity, zIndex: z, filter: `${filter === 'none' ? '' : filter} ${p.blur ? `blur(${p.blur.toFixed(1)}px)` : ''}`.trim() || undefined, ...style }}>{children}</div>;
};

// карточка: картинка или клип (кадры jpg 30 к/с, крутятся по кругу)
export const Card: React.FC<Base & { w: number; h?: number; src?: string; clip?: string; n?: number }> = ({ w, h = Math.round(w * 9 / 16), src, clip, n = 1, ...b }) => {
  const t = useT();
  const k = Math.floor(Math.max(0, t - b.at) * 30) % n + 1;
  const file = clip ? `clips/${clip}/${String(k).padStart(4, '0')}.jpg` : `img/${src}`;
  return (
    <Pop from={[0, 180]} filter="none" {...b}>
      <div style={{ width: w, height: h, borderRadius: 30, overflow: 'hidden', background: '#222', boxShadow: '0 30px 50px rgba(0,0,0,.30)' }}>
        <Img src={staticFile(file)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
    </Pop>
  );
};

export const Prop: React.FC<Base & { src: string; h: number; filter?: string }> = ({ src, h, filter, ...b }) => (
  <Pop float={5} filter={filter} {...b}><Img src={staticFile(`img/${src}`)} style={{ height: h, display: 'block' }} /></Pop>
);

export const Emo: React.FC<Base & { ch: string; size: number }> = ({ ch, size, ...b }) => (
  <Pop dur={0.45} from={[0, 50]} float={6} z={15} filter="drop-shadow(0 10px 12px rgba(0,0,0,.28))" {...b}>
    <div style={{ fontFamily: 'Noto Color Emoji', fontSize: size, lineHeight: 1, whiteSpace: 'nowrap' }}>{ch}</div>
  </Pop>
);

// подпись: буквы печатаются с размытием; в конце сцены разлетаются
export const Cap: React.FC<{ text: string; size: number; at: number; x: number; y: number; cps?: number; r?: number; col?: string; shadow?: string }> = ({ text, size, at, x, y, cps = 34, r = -2, col, shadow }) => {
  const t = useT(); const { end, dark } = useContext(BeatCtx); const t1 = end - 0.3;
  if (t < at || t > t1 + 0.7) return null;
  const color = col || (dark ? '#fff' : INK);
  return (
    <div style={{ ...abs, transform: tf({ x, y, r }), zIndex: 20, fontFamily: 'Osw', fontWeight: 700, fontSize: size, lineHeight: 1, whiteSpace: 'nowrap', letterSpacing: '.01em',
      textShadow: shadow || (dark ? '0 6px 18px rgba(0,0,0,.55)' : undefined) }}>
      {[...text].map((ch, i) => {
        let st: React.CSSProperties;
        if (t < t1) { const a = at + i / cps, k = outExpo(P(t, a, 0.45)); st = { transform: `translateX(${((1 - k) * 0.45 * size).toFixed(1)}px)`, filter: k < 0.98 ? `blur(${((1 - k) * 9).toFixed(1)}px)` : undefined, opacity: t >= a ? Math.min(1, k * 1.4) : 0 }; }
        else { const u = P(t, t1 + i * 0.012, 0.5), e = u * u, ang = rnd(i, 3) * Math.PI * 2, d = 160 + rnd(i, 4) * 260;
          st = { transform: `translate(${(Math.cos(ang) * d * e).toFixed(1)}px,${(Math.sin(ang) * d * e - 80 * e).toFixed(1)}px) rotate(${((rnd(i, 5) - 0.5) * 540 * e).toFixed(1)}deg)`, opacity: 1 - u }; }
        return <span key={i} style={{ display: 'inline-block', color, ...st }}>{ch === ' ' ? ' ' : ch}</span>;
      })}
    </div>
  );
};

export const BigNum: React.FC<Base & { n: string; sub: string; col?: string }> = ({ n, sub, col = INK, ...b }) => (
  <Pop float={6} {...b}>
    <div style={{ minWidth: 380, padding: '26px 40px', borderRadius: 34, background: '#fff', fontFamily: 'Osw', fontWeight: 700, color: col, textAlign: 'center', lineHeight: 1 }}>
      <div style={{ fontSize: 120, whiteSpace: 'nowrap' }}>{n}</div>
      <div style={{ fontSize: 38, color: INK, marginTop: 8, whiteSpace: 'nowrap' }}>{sub}</div>
    </div>
  </Pop>
);

export const Plate: React.FC<Base & { text: string; col?: string; bg?: string }> = ({ text, col = '#fff', bg = INK, ...b }) => (
  <Pop float={4} {...b}>
    <div style={{ padding: '10px 34px', borderRadius: 16, background: bg, color: col, fontFamily: 'Osw', fontWeight: 700, fontSize: 60, whiteSpace: 'nowrap' }}>{text}</div>
  </Pop>
);

// бегущие шевроны-стрелка
export const Arrow: React.FC<Base> = (b) => {
  const t = useT();
  return (
    <Pop filter="none" {...b}>
      <svg width={220} height={120}>{[0, 1, 2].map((i) => (
        <path key={i} d={`M${20 + i * 62} 15 L${70 + i * 62} 60 L${20 + i * 62} 105`} fill="none" stroke="#fff" strokeWidth={20} strokeLinecap="round" strokeLinejoin="round"
          opacity={0.25 + 0.75 * (fr(t * 1.6 - i * 0.22) < 0.4 ? 1 : 0)} style={{ stroke: INK }} />
      ))}</svg>
    </Pop>
  );
};
export { RED, INK, E };
