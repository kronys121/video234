// Шорт GTA 6 для TikTok / Shorts / Reels: 1080x1920, 60 к/с, ~1:03.
// Картинка — тот же движок монтажа, что и в полном ролике (public/site/gta6): вырезки, иконки, надписи, цифры.
// Монтаж стоит по центру с мягкими краями, за ним — размытая копия того же кадра. Сверху крючок, снизу субтитры по словам,
// в конце карточка «продолжение на канале @kronyscs». Звук — один файл: куски озвучки + музыка.
import React, { useEffect, useRef, useState } from 'react';
import { AbsoluteFill, Audio, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, Easing } from 'remotion';
import D from './short_data.json';

export const FPS = 60;
export const TOTAL_FRAMES = Math.round(D.total * FPS);
const VO = D.vo;                       // конец озвучки, дальше финальная карточка
const YEL = '#FFE135';
const CHANNEL = '@kronyscs';
const HOOK = ['GTA 6 НЕ ДОЛЖНА', 'БЫЛА РАБОТАТЬ НА PS5'];

// время шорта -> время полного ролика (по кускам озвучки)
function engineTime(st: number): number {
  let acc = 0;
  for (const [a, b] of D.segs) { if (st < acc + (b - a)) return a + (st - acc); acc += b - a; }
  const last = D.segs[D.segs.length - 1]; return last[1] - 1 / FPS;
}

type EngineWindow = Window & { __ready?: boolean; renderAt?: (t: number) => Promise<void> };
const Engine: React.FC<{ t: number; style: React.CSSProperties; name: string }> = ({ t, style, name }) => {
  const ref = useRef<HTMLIFrameElement>(null);
  const [loaded] = useState(() => delayRender(`загрузка движка (${name})`, { timeoutInMilliseconds: 240000 }));
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const id = setInterval(() => { const w = ref.current?.contentWindow as EngineWindow | null; if (w?.__ready) { clearInterval(id); setOk(true); continueRender(loaded); } }, 50);
    return () => clearInterval(id);
  }, [loaded]);
  useEffect(() => {
    if (!ok) return;
    const h = delayRender(`кадр ${t.toFixed(3)} (${name})`, { timeoutInMilliseconds: 120000 });
    (ref.current!.contentWindow as EngineWindow).renderAt!(t).then(() => requestAnimationFrame(() => continueRender(h)));
  }, [ok, t, name]);
  return <iframe ref={ref} src={staticFile('site/gta6/index.html')} style={{ position: 'absolute', width: 1920, height: 1080, border: 0, ...style }} />;
};

// шрифт Inter Black для надписей
const useFonts = () => {
  const [h] = useState(() => delayRender('шрифты'));
  useEffect(() => {
    const f1 = new FontFace('InterBlack', `url(${staticFile('fonts/Inter-Black.otf')})`);
    const f2 = new FontFace('InterXB', `url(${staticFile('fonts/Inter-ExtraBold.otf')})`);
    Promise.all([f1.load(), f2.load()]).then((fs) => { fs.forEach((f) => document.fonts.add(f)); continueRender(h); });
  }, [h]);
};

const stroke = (px: number): React.CSSProperties => ({ WebkitTextStroke: `${px * 2}px #000`, paintOrder: 'stroke fill', textShadow: '0 6px 14px rgba(0,0,0,.45)' });
const pop = (st: number, t0: number, d = 0.18, from = 0.6) => interpolate(st, [t0, t0 + d], [from, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.6)) });
const fade = (st: number, a: number, b: number) => interpolate(st, [a, b], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

// субтитры: по 1–2 слова, текущее слово жёлтое с «прыжком»
type Wd = { w: string; t: number; e: number };
const CAPS: { s: number; e: number; g: Wd[]; k: number }[] = [];
D.groups.forEach((g: Wd[], gi: number) => {
  const nxt = gi + 1 < D.groups.length ? D.groups[gi + 1][0].t : VO;
  g.forEach((w, k) => CAPS.push({ s: w.t, e: k + 1 < g.length ? g[k + 1].t : Math.min(w.e + 0.25, nxt), g, k }));
});
const Captions: React.FC<{ st: number }> = ({ st }) => {
  const c = CAPS.find((x) => st >= x.s && st < x.e);
  if (!c) return null;
  const sc = interpolate(st, [c.s, c.s + 0.09], [1.12, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'absolute', left: 40, right: 40, top: 1420, textAlign: 'center', fontFamily: 'InterBlack', fontSize: 78, lineHeight: 1.1, color: '#fff', ...stroke(4) }}>
      {c.g.map((w, j) => (
        <span key={j} style={{ display: 'inline-block', margin: '0 0.14em', ...(j === c.k ? { color: YEL, transform: `scale(${sc})` } : {}) }}>{w.w}</span>
      ))}
    </div>
  );
};

export const Short: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const st = frame / FPS;
  const t = engineTime(Math.min(st, VO - 1 / FPS));
  const end = st >= VO;
  const kEnd = fade(st, VO, VO + 0.25);
  return (
    <AbsoluteFill style={{ background: '#d9d9d9', overflow: 'hidden' }}>
      {/* фон: тот же кадр, растянут на весь экран и размыт */}
      <div style={{ position: 'absolute', inset: 0, filter: `blur(60px) brightness(${0.97 - 0.27 * kEnd})`, transform: 'scale(1.1)' }}>
        <Engine name="фон" t={t} style={{ left: (1080 - 1920 * 16 / 9) / 2, top: 0, transform: `scale(${16 / 9})`, transformOrigin: '0 0' }} />
      </div>
      {/* монтаж по центру: 1440x810, края обрезаны до 1080, сверху и снизу мягкий переход */}
      <div style={{ position: 'absolute', left: 0, top: 520, width: 1080, height: 810, overflow: 'hidden', opacity: 1 - kEnd,
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0, #000 90px, #000 720px, transparent 810px)', maskImage: 'linear-gradient(to bottom, transparent 0, #000 90px, #000 720px, transparent 810px)' }}>
        <Engine name="монтаж" t={t} style={{ left: -180, top: 0, transform: 'scale(0.75)', transformOrigin: '0 0' }} />
      </div>
      {/* крючок сверху (0–4 с) */}
      {st < 4 && (
        <div style={{ position: 'absolute', left: 40, right: 40, top: 250, textAlign: 'center', fontFamily: 'InterBlack', fontSize: 76, lineHeight: 1.15, color: '#fff',
          transform: `scale(${pop(st, 0, 0.18, 0.7)})`, opacity: 1 - fade(st, 3.8, 4), ...stroke(4) }}>
          {HOOK.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      )}
      {/* метка канала сверху */}
      {st >= 4 && !end && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 90, textAlign: 'center', fontFamily: 'InterXB', fontSize: 46, color: '#fff', opacity: 0.8 * fade(st, 4, 4.3), ...stroke(2) }}>{CHANNEL}</div>
      )}
      {!end && <Captions st={st} />}
      {/* финальная карточка */}
      {end && (
        <>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 700, textAlign: 'center', fontFamily: 'InterBlack', fontSize: 96, lineHeight: 1.15, color: '#fff',
            opacity: fade(st, VO + 0.05, VO + 0.2), transform: `scale(${pop(st, VO + 0.05, 0.2)})`, ...stroke(4) }}>ПРОДОЛЖЕНИЕ<br />НА КАНАЛЕ</div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 1005, textAlign: 'center', fontFamily: 'InterBlack', fontSize: 120, color: YEL,
            opacity: fade(st, VO + 0.35, VO + 0.5), transform: `scale(${pop(st, VO + 0.35, 0.22, 0.5)})`, ...stroke(5) }}>{CHANNEL}</div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 1250, textAlign: 'center', fontFamily: 'InterBlack', fontSize: 64, color: '#fff',
            opacity: fade(st, VO + 0.7, VO + 0.85), transform: `translateY(${Math.sin(st * 6) * 8}px)`, ...stroke(3) }}>ПОЛНЫЙ РАЗБОР ↓</div>
        </>
      )}
      <Audio src={staticFile('media/short_audio.m4a')} />
    </AbsoluteFill>
  );
};
