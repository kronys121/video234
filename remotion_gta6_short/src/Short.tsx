// Шорты GTA 6 для TikTok / Shorts / Reels: 1080x1920, 60 к/с.
// Картинка — тот же движок монтажа, что и в полном ролике (public/site/gta6): вырезки, иконки, надписи, цифры.
// Окно монтажа по центру с мягкими краями; для каждой сцены заранее подобраны масштаб и центр (data.cams),
// чтобы все элементы сцены целиком помещались в вертикальный кадр. За окном — размытая копия того же кадра.
// Сверху крючок, снизу субтитры по словам, в конце карточка «продолжение на канале @kronyscs».
import React, { useEffect, useRef, useState } from 'react';
import { AbsoluteFill, Audio, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, Easing } from 'remotion';

export const FPS = 60;
const YEL = '#FFE135';
const CHANNEL = '@kronyscs';
const WIN_TOP = 470;                   // зона окна монтажа: 1080 x 900, y 470…1370 (окно по высоте кадра, по центру зоны)

type Wd = { w: string; t: number; e: number };
type Cam = { si: number; t0: number; t1: number; s: number; h: number; cx: number; cy: number };
export type ShortData = { segs: number[][]; vo: number; end: number; total: number; hook: string[]; groups: Wd[][]; cams: Cam[]; win: { w: number; h: number } };
export type ShortProps = { data: ShortData; audio: string };

// время шорта -> время полного ролика (по кускам озвучки)
function engineTime(D: ShortData, st: number): number {
  let acc = 0;
  for (const [a, b] of D.segs) { if (st < acc + (b - a)) return a + (st - acc); acc += b - a; }
  const last = D.segs[D.segs.length - 1]; return last[1] - 1 / FPS;
}
// камера окна: своя у каждой сцены, на стыке сцен — плавный переход за 0,3 с
function camAt(D: ShortData, t: number) {
  const cs = D.cams; let i = cs.findIndex((c) => t >= c.t0 && t < c.t1); if (i < 0) i = t < cs[0].t0 ? 0 : cs.length - 1;
  const c = cs[i]; const T = 0.15;
  const blend = (a: Cam, b: Cam, k: number) => { const e = Easing.inOut(Easing.cubic)(k); return { s: a.s + (b.s - a.s) * e, h: a.h + (b.h - a.h) * e, cx: a.cx + (b.cx - a.cx) * e, cy: a.cy + (b.cy - a.cy) * e }; };
  if (i > 0 && t < c.t0 + T && Math.abs(cs[i - 1].t1 - c.t0) < 0.01) return blend(cs[i - 1], c, (t - (c.t0 - T)) / (2 * T));
  if (i + 1 < cs.length && t > c.t1 - T && Math.abs(cs[i + 1].t0 - c.t1) < 0.01) return blend(c, cs[i + 1], (t - (c.t1 - T)) / (2 * T));
  return c;
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
// размер шрифта, чтобы строка точно влезла в ширину (Inter Black, заглавные ≈ 0,72 em на букву)
const fit = (text: string, max: number, width: number) => Math.min(max, Math.floor(width / (Math.max(1, text.length) * 0.72)));

const Captions: React.FC<{ D: ShortData; st: number }> = ({ D, st }) => {
  const caps: { s: number; e: number; g: Wd[]; k: number }[] = [];
  D.groups.forEach((g, gi) => {
    const nxt = gi + 1 < D.groups.length ? D.groups[gi + 1][0].t : D.vo;
    g.forEach((w, k) => caps.push({ s: w.t, e: k + 1 < g.length ? g[k + 1].t : Math.min(w.e + 0.25, nxt), g, k }));
  });
  const c = caps.find((x) => st >= x.s && st < x.e);
  if (!c) return null;
  const sc = interpolate(st, [c.s, c.s + 0.09], [1.1, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const size = fit(c.g.map((w) => w.w).join(' '), 78, 900);
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top: 1420, textAlign: 'center', whiteSpace: 'nowrap', fontFamily: 'InterBlack', fontSize: size, lineHeight: 1.1, color: '#fff', ...stroke(4) }}>
      {c.g.map((w, j) => (
        <span key={j} style={{ display: 'inline-block', margin: '0 0.26em', ...(j === c.k ? { color: YEL, transform: `scale(${sc})` } : {}) }}>{w.w}</span>
      ))}
    </div>
  );
};

export const Short: React.FC<ShortProps> = ({ data: D, audio }) => {
  useFonts();
  const frame = useCurrentFrame();
  const st = frame / FPS;
  const VO = D.vo;
  const t = engineTime(D, Math.min(st, VO - 1 / FPS));
  const end = st >= VO;
  const kEnd = fade(st, VO, VO + 0.25);
  const cam = camAt(D, t);
  const W = D.win.w, H = cam.h, top = WIN_TOP + (D.win.h - cam.h) / 2;
  const hookSize = Math.min(76, ...D.hook.map((l) => fit(l, 76, 960)));
  const mask = `linear-gradient(to bottom, transparent 0, #000 22px, #000 ${H - 22}px, transparent ${H}px)`;
  return (
    <AbsoluteFill style={{ background: '#d9d9d9', overflow: 'hidden' }}>
      {/* фон: тот же кадр, растянут на весь экран и размыт */}
      <div style={{ position: 'absolute', inset: 0, filter: `blur(60px) brightness(${0.97 - 0.27 * kEnd})`, transform: 'scale(1.1)' }}>
        <Engine name="фон" t={t} style={{ left: (1080 - 1920 * 16 / 9) / 2, top: 0, transform: `scale(${16 / 9})`, transformOrigin: '0 0' }} />
      </div>
      {/* окно монтажа: масштаб и центр по сцене — все элементы целиком в кадре */}
      <div style={{ position: 'absolute', left: 0, top, width: W, height: H, overflow: 'hidden', opacity: 1 - kEnd, WebkitMaskImage: mask, maskImage: mask }}>
        <Engine name="монтаж" t={t} style={{ left: 0, top: 0, transformOrigin: '0 0', transform: `translate(${W / 2 - cam.cx * cam.s}px, ${H / 2 - cam.cy * cam.s}px) scale(${cam.s})` }} />
      </div>
      {/* крючок сверху (0–4 с) */}
      {st < 4 && (
        <div style={{ position: 'absolute', left: 40, right: 40, top: 250, textAlign: 'center', whiteSpace: 'nowrap', fontFamily: 'InterBlack', fontSize: hookSize, lineHeight: 1.15, color: '#fff',
          transform: `scale(${pop(st, 0, 0.18, 0.7)})`, opacity: 1 - fade(st, 3.8, 4), ...stroke(4) }}>
          {D.hook.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      )}
      {st >= 4 && !end && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 90, textAlign: 'center', fontFamily: 'InterXB', fontSize: 46, color: '#fff', opacity: 0.8 * fade(st, 4, 4.3), ...stroke(2) }}>{CHANNEL}</div>
      )}
      {!end && <Captions D={D} st={st} />}
      {/* под субтитрами — где смотреть полное видео */}
      {!end && (
        <div style={{ position: 'absolute', left: 40, right: 40, top: 1575, textAlign: 'center', fontFamily: 'InterXB', fontSize: 44, lineHeight: 1.2, color: '#fff', opacity: fade(st, 0.3, 0.6), ...stroke(3) }}>
          ПОЛНОЕ ВИДЕО<br />НА YOUTUBE-КАНАЛЕ <span style={{ color: YEL }}>KRONYS</span>
        </div>
      )}
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
      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
};
