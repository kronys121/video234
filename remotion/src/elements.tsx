// Элементы ролика. Каждый создан через Interactive.create, поэтому в Studio его можно
// выделить на таймлайне, сдвинуть по времени и поменять положение, текст и наклон.
import React from 'react';
import { Img, Interactive, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import { Video } from '@remotion/media';
import { colorCorrection } from '@remotion/effects/color-correction';
import { Circle, Underline, Highlight, Box } from '@remotion/rough-notation';
import { INK, RED, P, outExpo, rnd, tf, popIn, fr } from './engine';

const SH = 'drop-shadow(0 30px 30px rgba(0,0,0,.32))';
const abs: React.CSSProperties = { position: 'absolute', left: 0, top: 0 };
const num = (description: string, def = 0, step = 1) => ({ type: 'number' as const, default: def, step, description, hiddenFromList: false });
const str = (description: string, def = '') => ({ type: 'string' as const, default: def, description });
const posSchema = { x: num('X'), y: num('Y'), r: num('Наклон', 0, 0.5) };

// локальное время элемента (сек) и время ухода (конец его отрезка на таймлайне)
const useLocal = () => {
  const f = useCurrentFrame(); const { fps, durationInFrames } = useVideoConfig();
  return { t: f / fps, f, fps, leave: durationInFrames / fps };
};

// пометка от руки: обводка, подчёркивание, маркер, рамка
export type Mark = { kind: 'circle' | 'underline' | 'highlight' | 'box'; at: number; color?: string };
const Marked: React.FC<{ mark?: Mark; children: React.ReactNode }> = ({ mark, children }) => {
  const { f, fps } = useLocal();
  if (!mark) return <>{children}</>;
  const progress = interpolate(f, [mark.at * fps, (mark.at + 0.6) * fps], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.33, 1, 0.68, 1) });
  const color = mark.color || RED;
  if (mark.kind === 'circle') return <Circle progress={progress} color={color} strokeWidth={7} padding={{ left: 30, right: 30, top: 8, bottom: 2 }} showInTimeline={false}>{children}</Circle>;
  if (mark.kind === 'underline') return <Underline progress={progress} color={color} strokeWidth={8} showInTimeline={false}>{children}</Underline>;
  if (mark.kind === 'box') return <Box progress={progress} color={color} strokeWidth={6} showInTimeline={false}>{children}</Box>;
  return <Highlight progress={progress} color="rgba(255,204,51,.7)" showInTimeline={false}>{children}</Highlight>;
};

// общая анимация появления
type PopProps = { x: number; y: number; r?: number; float?: number; dur?: number; fromX?: number; fromY?: number; filter?: string; z?: number; style?: React.CSSProperties; children: React.ReactNode };
const Pop: React.FC<PopProps> = ({ x, y, r = 0, float = 0, dur, fromX = 0, fromY = 180, filter = SH, z, style, children }) => {
  const { t } = useLocal();
  const p = popIn(t, 0, x, y, { r, float, dur, from: [fromX, fromY] });
  const f = [filter === 'none' ? '' : filter, p.blur ? `blur(${p.blur.toFixed(1)}px)` : ''].join(' ').trim();
  return <div style={{ ...abs, ...style, transform: p.transform, opacity: p.opacity, zIndex: z, filter: f || undefined }}>{children}</div>;
};

// ---------- карточка с видеоклипом (mp4) ----------
const ClipInner: React.FC<{ src: string; w: number; x: number; y: number; r: number; style?: React.CSSProperties }> = ({ src, w, x, y, r, style }) => (
  <Pop x={x} y={y} r={r} filter="none" style={style}>
    <div style={{ width: w, height: Math.round(w * 9 / 16), borderRadius: 30, overflow: 'hidden', background: '#222', boxShadow: '0 30px 50px rgba(0,0,0,.30)' }}>
      <Video src={staticFile(`clips/${src}`)} muted loop objectFit="cover" showInTimeline={false} style={{ width: '100%', height: '100%' }}
        effects={[colorCorrection({ contrast: 1.08, saturation: 1.12, vibrance: 0.15 })]} />
    </div>
  </Pop>
);
export const Clip = Interactive.create({ Component: ClipInner, layout: 'none', schema: { ...posSchema, w: num('Ширина', 640) } });

// ---------- картинка в карточке (обложка) ----------
const PicInner: React.FC<{ src: string; w: number; h: number; x: number; y: number; r: number; style?: React.CSSProperties }> = ({ src, w, h, x, y, r, style }) => (
  <Pop x={x} y={y} r={r} filter="none" style={style}>
    <div style={{ width: w, height: h, borderRadius: 30, overflow: 'hidden', background: '#222', boxShadow: '0 30px 50px rgba(0,0,0,.30)' }}>
      <Img src={staticFile(`img/${src}`)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
    </div>
  </Pop>
);
export const Pic = Interactive.create({ Component: PicInner, layout: 'none', schema: { ...posSchema, w: num('Ширина', 400), h: num('Высота', 500) } });

// ---------- предмет без рамки (PS4, логотип, персонаж) ----------
const PropInner: React.FC<{ src: string; h: number; x: number; y: number; r?: number; float?: number; fromX?: number; glow?: boolean; style?: React.CSSProperties }> = ({ src, h, x, y, r = 0, float = 5, fromX, glow, style }) => (
  <Pop x={x} y={y} r={r} float={float} fromX={fromX} fromY={fromX ? 0 : 180} filter={glow ? 'drop-shadow(0 10px 25px rgba(0,0,0,.7))' : SH} style={style}>
    <Img src={staticFile(`img/${src}`)} style={{ height: h, display: 'block' }} />
  </Pop>
);
export const Prop = Interactive.create({ Component: PropInner, layout: 'none', schema: { ...posSchema, h: num('Высота', 300) } });

// ---------- подпись: буквы печатаются, в конце разлетаются ----------
const CapInner: React.FC<{ text: string; size: number; x: number; y: number; r?: number; cps?: number; color?: string; dark?: boolean; mark?: Mark; style?: React.CSSProperties }> = ({ text, size, x, y, r = -2, cps = 34, color, dark, mark, style }) => {
  const { t, leave } = useLocal(); const t1 = leave - 1.3; // разлетается за 0.3 с до конца сцены
  const col = color || (dark ? '#fff' : INK);
  return (
    <div style={{ ...abs, ...style, transform: tf({ x, y, r }), zIndex: 20, fontFamily: 'Osw', fontWeight: 700, fontSize: size, lineHeight: 1, whiteSpace: 'nowrap', letterSpacing: '.01em',
      textShadow: dark ? '0 10px 30px rgba(0,0,0,.6)' : undefined }}>
      <Marked mark={mark}>{[...text].map((ch, i) => {
        let st: React.CSSProperties;
        if (t < t1) { const a = i / cps, k = outExpo(P(t, a, 0.45)); st = { transform: `translateX(${((1 - k) * 0.45 * size).toFixed(1)}px)`, filter: k < 0.98 ? `blur(${((1 - k) * 9).toFixed(1)}px)` : undefined, opacity: t >= a ? Math.min(1, k * 1.4) : 0 }; }
        else { const u = P(t, t1 + i * 0.012, 0.5), e = u * u, ang = rnd(i, 3) * Math.PI * 2, d = 160 + rnd(i, 4) * 260;
          st = { transform: `translate(${(Math.cos(ang) * d * e).toFixed(1)}px,${(Math.sin(ang) * d * e - 80 * e).toFixed(1)}px) rotate(${((rnd(i, 5) - 0.5) * 540 * e).toFixed(1)}deg)`, opacity: 1 - u }; }
        return <span key={i} style={{ display: 'inline-block', color: col, ...st }}>{ch === ' ' ? ' ' : ch}</span>;
      })}</Marked>
    </div>
  );
};
export const Cap = Interactive.create({ Component: CapInner, layout: 'none', schema: { ...posSchema, text: str('Текст'), size: num('Размер', 100) } });

// ---------- большая цифра в белой плашке ----------
const BigNumInner: React.FC<{ n: string; sub: string; x: number; y: number; color?: string; mark?: Mark; style?: React.CSSProperties }> = ({ n, sub, x, y, color = INK, mark, style }) => (
  <Pop x={x} y={y} float={6} style={style}>
    <div style={{ minWidth: 380, padding: '26px 40px', borderRadius: 34, background: '#fff', fontFamily: 'Osw', fontWeight: 700, color, textAlign: 'center', lineHeight: 1 }}>
      <div style={{ fontSize: 120, whiteSpace: 'nowrap' }}><Marked mark={mark}>{n}</Marked></div>
      <div style={{ fontSize: 38, color: INK, marginTop: 8, whiteSpace: 'nowrap' }}>{sub}</div>
    </div>
  </Pop>
);
export const BigNum = Interactive.create({ Component: BigNumInner, layout: 'none', schema: { ...posSchema, n: str('Число'), sub: str('Подпись') } });

// ---------- плашка ----------
const PlateInner: React.FC<{ text: string; x: number; y: number; bg?: string; color?: string; mark?: Mark; style?: React.CSSProperties }> = ({ text, x, y, bg = INK, color = '#fff', mark, style }) => (
  <Pop x={x} y={y} float={4} style={style}>
    <Marked mark={mark}><div style={{ padding: '10px 34px', borderRadius: 16, background: bg, color, fontFamily: 'Osw', fontWeight: 700, fontSize: 60, whiteSpace: 'nowrap' }}>{text}</div></Marked>
  </Pop>
);
export const Plate = Interactive.create({ Component: PlateInner, layout: 'none', schema: { ...posSchema, text: str('Текст') } });

// ---------- эмодзи ----------
const EmoInner: React.FC<{ ch: string; size: number; x: number; y: number; style?: React.CSSProperties }> = ({ ch, size, x, y, style }) => (
  <Pop x={x} y={y} dur={0.45} fromY={50} float={6} z={15} filter="drop-shadow(0 10px 12px rgba(0,0,0,.28))" style={style}>
    <div style={{ fontFamily: 'Noto Color Emoji', fontSize: size, lineHeight: 1, whiteSpace: 'nowrap' }}>{ch}</div>
  </Pop>
);
export const Emo = Interactive.create({ Component: EmoInner, layout: 'none', schema: { ...posSchema, size: num('Размер', 140) } });

// ---------- бегущие шевроны-стрелка ----------
const ArrowInner: React.FC<{ x: number; y: number; style?: React.CSSProperties }> = ({ x, y, style }) => {
  const { t } = useLocal();
  return (
    <Pop x={x} y={y} filter="none" style={style}>
      <svg width={220} height={120}>{[0, 1, 2].map((i) => (
        <path key={i} d={`M${20 + i * 62} 15 L${70 + i * 62} 60 L${20 + i * 62} 105`} fill="none" stroke={INK} strokeWidth={20} strokeLinecap="round" strokeLinejoin="round"
          opacity={0.25 + 0.75 * (fr(t * 1.6 - i * 0.22) < 0.4 ? 1 : 0)} />
      ))}</svg>
    </Pop>
  );
};
export const Arrow = Interactive.create({ Component: ArrowInner, layout: 'none', schema: posSchema });

// ---------- белая карточка с логотипом Sony ----------
const LogoCardInner: React.FC<{ src: string; x: number; y: number; style?: React.CSSProperties }> = ({ src, x, y, style }) => (
  <Pop x={x} y={y} float={5} style={style}>
    <div style={{ padding: '50px 60px', borderRadius: 30, background: '#fff' }}><Img src={staticFile(`img/${src}`)} style={{ width: 420, display: 'block' }} /></div>
  </Pop>
);
export const LogoCard = Interactive.create({ Component: LogoCardInner, layout: 'none', schema: posSchema });

// ---------- карточка «?» (новая игра) ----------
const QuestionInner: React.FC<{ x: number; y: number; style?: React.CSSProperties }> = ({ x, y, style }) => (
  <Pop x={x} y={y} float={4} style={style}>
    <div style={{ width: 220, height: 278, borderRadius: 18, background: '#111', border: '4px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Osw', fontWeight: 700, fontSize: 150, color: '#fff' }}>?</div>
  </Pop>
);
export const Question = Interactive.create({ Component: QuestionInner, layout: 'none', schema: posSchema });
