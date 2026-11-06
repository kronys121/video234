// Первая минута TLOU2 на Remotion: та же озвучка и сцены, плюс новые возможности —
// элементы редактируются в Studio, настоящее размытие в движении, цветокоррекция,
// плёночное зерно, засветы на переходах, пометки от руки и звуки переходов.
import React from 'react';
import { AbsoluteFill, Img, Interactive, interpolate, isHtmlInCanvasSupported, Solid, staticFile, Track, useCurrentFrame, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { HtmlInCanvasMotionBlur } from '@remotion/motion-blur';
import { blur } from '@remotion/effects/blur';
import { colorCorrection } from '@remotion/effects/color-correction';
import { noise } from '@remotion/effects/noise';
import { lightLeak } from '@remotion/effects/light-leak';
import { E, P, beatPos, makeCamera, Cam, BeatPos, INK, RED } from './engine';
import { Clip, Pic, Prop, Cap, BigNum, Plate, Emo, Arrow, LogoCard, Question } from './elements';

export const MINUTE_SEC = 60;
// размытие в движении: число промежуточных снимков на кадр (больше — плавнее, но рендер дольше)
const MOTION_BLUR_SAMPLES = 6;

const FONT = `
@font-face{font-family:'Osw';font-weight:700;src:url('${staticFile('fonts/osw-cyr.woff2')}') format('woff2');unicode-range:U+0400-045F}
@font-face{font-family:'Osw';font-weight:700;src:url('${staticFile('fonts/osw-lat.woff2')}') format('woff2');unicode-range:U+0000-00FF,U+2000-206F}`;

type Beat = { t0: number; end: number; bg: string | null; cam: Cam; body: () => React.ReactNode };

// ---------- сцены ----------
// from и durationInFrames — в кадрах (60 к/с); их можно двигать мышкой на таймлайне Studio.
// Сцена в мире стоит на своём месте, камера перелетает между ними.
const BEATS: Beat[] = [
  { t0: 0.0, end: 4.24, bg: 'img/bg_forest.jpg', cam: { keys: [[0, 2.6, 0, 0, 1.06]] }, body: () => (
      <>
        <Pic from={9} durationInFrames={305} name="Обложка PS4" src="cover_ps4.jpg" w={400} h={505} x={-520} y={30} r={-4} />
        <Prop from={41} durationInFrames={273} name="Логотип TLOU2" src="logo_white.png" h={230} x={240} y={-80} float={3} glow />
        <Cap from={61} durationInFrames={253} name="НА PS4" text="НА PS4" size={110} x={240} y={150} cps={20} r={0} dark />
      </>
    ) },
  { t0: 4.24, end: 10.05, bg: null, cam: { z: 0.92 }, body: () => (
      <>
        <Clip from={264} durationInFrames={399} name="Клип: город" src="city1.mp4" w={640} x={-560} y={-190} r={-2} />
        <Clip from={361} durationInFrames={302} name="Клип: враги" src="enemy1.mp4" w={640} x={300} y={-200} r={2} />
        <Clip from={480} durationInFrames={183} name="Клип: собака" src="dogsniff.mp4" w={620} x={-380} y={230} r={-2} />
        <Emo from={483} durationInFrames={180} name="Звук" ch="🔊" size={140} x={520} y={230} />
      </>
    ) },
  { t0: 10.05, end: 13.59, bg: 'img/blue.jpg', cam: {}, body: () => (
      <>
        <Prop from={609} durationInFrames={266} name="PS4" src="ps4.png" h={330} x={-320} y={80} />
        <BigNum from={695} durationInFrames={180} name="7 лет" n="7 ЛЕТ" sub="консоли к выходу игры" color={RED} x={420} y={20} mark={{ kind: 'circle', at: 0.7, color: RED }} />
      </>
    ) },
  { t0: 13.59, end: 18.27, bg: null, cam: {}, body: () => (
      <>
        <Pic from={821} durationInFrames={335} name="Обложка PS4" src="cover_ps4.jpg" w={360} h={455} x={-500} y={20} r={-3} />
        <Cap from={913} durationInFrames={243} name="Через несколько месяцев" text="ЧЕРЕЗ НЕСКОЛЬКО МЕСЯЦЕВ" size={70} x={260} y={-260} mark={{ kind: 'underline', at: 0.9, color: RED }} />
        <Prop from={976} durationInFrames={180} name="PS5" src="ps5.png" h={520} x={360} y={60} />
      </>
    ) },
  { t0: 18.27, end: 21.38, bg: 'img/pcb.jpg', cam: { keys: [[18.27, 2.0, 0, 0, 1.08]] }, body: () => (
      <>
        <Cap from={1110} durationInFrames={233} name="Почему не на PS5" text="ПОЧЕМУ НЕ НА PS5?" size={140} x={0} y={0} cps={40} r={0} dark />
        <Prop from={1129} durationInFrames={214} name="Naughty Dog" src="nd_logo.png" h={110} x={0} y={230} float={3} />
      </>
    ) },
  { t0: 21.38, end: 31.08, bg: null, cam: {}, body: () => (
      <>
        <Cap from={1430} durationInFrames={495} name="2014" text="2014" size={220} x={-380} y={-40} cps={10} r={-3} />
        <Arrow from={1458} durationInFrames={467} name="Стрелка" x={60} y={-40} />
        <Cap from={1502} durationInFrames={423} name="2020" text="2020" size={220} x={460} y={-40} cps={10} r={3} color={RED} mark={{ kind: 'circle', at: 0.8, color: INK }} />
        <Plate from={1706} durationInFrames={219} name="6 лет разработки" text="6 ЛЕТ РАЗРАБОТКИ" x={40} y={250} />
      </>
    ) },
  { t0: 31.08, end: 34.88, bg: 'img/bg_dark.jpg', cam: {}, body: () => (
      <>
        <Cap from={1955} durationInFrames={198} name="А должна ли" text="А ДОЛЖНА ЛИ ОНА ВООБЩЕ ПОЯВИТЬСЯ?" size={96} x={0} y={0} cps={40} r={0} dark />
      </>
    ) },
  { t0: 34.88, end: 39.08, bg: null, cam: { z: 0.95 }, body: () => (
      <>
        <Clip from={2190} durationInFrames={215} name="Клип: Джоэл" src="e_joel.mp4" w={620} x={400} y={120} r={2} />
        <Prop from={2225} durationInFrames={180} name="Джоэл" src="joel1_cut.png" h={700} x={-560} y={120} fromX={-300} float={4} />
        <Prop from={2234} durationInFrames={171} name="Элли" src="ellie1_cut.png" h={720} x={-240} y={140} fromX={-300} float={4} />
        <Plate from={2243} durationInFrames={162} name="История закончена" text="ИСТОРИЯ ЗАКОНЧЕНА?" x={420} y={-180} />
      </>
    ) },
  { t0: 39.08, end: 45.28, bg: null, cam: {}, body: () => (
      <>
        <Pic from={2351} durationInFrames={426} name="Обложка PS3" src="cover_ps3.jpg" w={380} h={525} x={-440} y={0} r={-3} />
        <Plate from={2428} durationInFrames={349} name="Идеальный финал" text="ИДЕАЛЬНЫЙ ФИНАЛ" bg="#2bb673" x={300} y={-150} />
        <Emo from={2597} durationInFrames={180} name="Деньги" ch="💸" size={150} x={300} y={120} />
        <Plate from={2609} durationInFrames={168} name="Сиквел ради денег" text="СИКВЕЛ РАДИ ДЕНЕГ?" bg={RED} x={300} y={300} mark={{ kind: 'underline', at: 0.7, color: INK }} />
      </>
    ) },
  { t0: 45.28, end: 52.18, bg: 'img/pcb.jpg', cam: {}, body: () => (
      <>
        <LogoCard from={2787} durationInFrames={404} name="Sony" src="sony_black.png" x={-420} y={-40} />
        <Plate from={2855} durationInFrames={336} name="Полная свобода" text="ПОЛНАЯ СВОБОДА" bg="#2bb673" x={320} y={-200} mark={{ kind: 'box', at: 0.7, color: '#ffcc33' }} />
        <Pic from={2914} durationInFrames={277} name="Сиквел" src="cover_ps4.jpg" w={220} h={278} x={160} y={140} r={-3} />
        <Cap from={2984} durationInFrames={207} name="ИЛИ" text="ИЛИ" size={90} x={380} y={140} cps={12} dark />
        <Question from={3011} durationInFrames={180} name="Новая игра" x={600} y={140} />
      </>
    ) },
  { t0: 52.18, end: 60.0, bg: null, cam: {}, body: () => (
      <>
        <Emo from={3160} durationInFrames={500} name="Идея" ch="💭" size={200} x={-560} y={-120} />
        <Clip from={3246} durationInFrames={414} name="Клип: сценаристы" src="t_hands.mp4" w={760} x={-120} y={100} r={-2} />
        <Cap from={3361} durationInFrames={299} name="А что, если" text="«А ЧТО, ЕСЛИ…»" size={110} x={0} y={-300} cps={24} mark={{ kind: 'highlight', at: 0.7 }} />
        <Plate from={3478} durationInFrames={182} name="Новая история" text="НОВАЯ ИСТОРИЯ" bg={RED} x={420} y={300} />
      </>
    ) },];
const POS: BeatPos[] = BEATS.map((b, i) => ({ i, t0: b.t0, cam: b.cam, ...beatPos(i) }));
const camAt = makeCamera(POS);
const useT = () => { const f = useCurrentFrame(); const { fps } = useVideoConfig(); return f / fps; };
const curBeat = (t: number) => { let c = 0; BEATS.forEach((b, i) => { if (t >= b.t0) c = i; }); return c; };

// мир со сценами и камерой
const World: React.FC = () => {
  const t = useT(); const c = camAt(t);
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, transformOrigin: '0 0',
      transform: `translate(960px,540px) perspective(2400px) rotateX(${(Math.sin(t * 0.21) * 5).toFixed(3)}deg) rotateY(${(Math.cos(t * 0.17) * 7).toFixed(3)}deg) rotate(${c.r.toFixed(3)}deg) scale(${c.z.toFixed(4)}) translate(${(-c.x).toFixed(1)}px,${(-c.y).toFixed(1)}px)` }}>
      {BEATS.map((b, i) => (
        <div key={i} className={b.bg ? 'dark' : undefined} style={{ position: 'absolute', left: POS[i].cx, top: POS[i].cy, width: 0, height: 0 }}>{b.body()}</div>
      ))}
    </div>
  );
};

// запасное размытие для браузеров без HTML-in-canvas: размываем весь кадр по скорости камеры
const FallbackBlur: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const t = useT(); const c = camAt(t);
  const c0 = camAt(t - 1 / 60), c1 = camAt(t + 1 / 60), zf = Math.abs(c1.z - c0.z) / c.z * 250;
  const bx = Math.min(26, Math.abs(c1.x - c0.x) * c.z * 0.22 + zf), by = Math.min(26, Math.abs(c1.y - c0.y) * c.z * 0.22 + zf);
  return (
    <AbsoluteFill style={{ filter: bx + by > 0.6 ? 'url(#mb)' : undefined }}>
      <svg width={0} height={0} style={{ position: 'absolute' }}><filter id="mb" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB"><feGaussianBlur stdDeviation={`${bx.toFixed(2)} ${by.toFixed(2)}`} edgeMode="duplicate" /></filter></svg>
      {children}
    </AbsoluteFill>
  );
};

// фоны сцен: размытый кадр игры с цветокоррекцией, новый проявляется поверх старого
const Backgrounds: React.FC = () => {
  const t = useT(); const cur = curBeat(t);
  const cb = BEATS[cur], pb = BEATS[cur - 1], k = E.inOut(P(t, cb.t0, 0.5));
  const layer = (b: Beat, op: number, x: number, s: number, z: number) => b.bg && (
    <div key={b.t0} style={{ position: 'absolute', inset: -60, zIndex: z, opacity: op, transform: `translateX(${x.toFixed(1)}px) scale(${s.toFixed(4)})` }}>
      <Img src={staticFile(b.bg)} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        effects={[blur({ radius: 9 }), colorCorrection({ exposure: -1, saturation: 0.8, temperature: -0.15, contrast: 1.1 })]} />
    </div>
  );
  return (
    <AbsoluteFill style={{ zIndex: 0 }}>
      <div style={{ position: 'absolute', inset: -40, background: '#f7f7f8' }} />
      {pb && layer(pb, cb.bg ? 1 : 1 - k, -80 * k, 1.04, 1)}
      {layer(cb, k, 80 * (1 - k) - (t - cb.t0) * 6, 1.04 + (t - cb.t0) * 0.006, 2)}
    </AbsoluteFill>
  );
};

// засвет на переходе между сценами
const LightLeakInner: React.FC<{ seed: number; hueShift: number; style?: React.CSSProperties }> = ({ seed, hueShift, style }) => {
  const frame = useCurrentFrame(); const { durationInFrames, width, height } = useVideoConfig();
  return <Solid width={width} height={height} style={{ ...style, position: 'absolute', inset: 0, mixBlendMode: 'screen', opacity: 0.45 }}
    effects={[lightLeak({ seed, hueShift, progress: interpolate(frame, [0, durationInFrames - 1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) })]} />;
};
const LightLeak = Interactive.create({ Component: LightLeakInner, layout: 'none', schema: {
  seed: { type: 'number', default: 0, step: 1, description: 'Узор', hiddenFromList: false },
  hueShift: { type: 'number', default: 0, min: 0, max: 360, step: 1, description: 'Оттенок', hiddenFromList: false } } });

// плёночное зерно поверх всего кадра
const Grain: React.FC = () => {
  const frame = useCurrentFrame(); const { width, height } = useVideoConfig();
  return <Solid width={width} height={height} color="#808080" style={{ position: 'absolute', inset: 0, mixBlendMode: 'overlay', opacity: 0.35 }}
    effects={[noise({ amount: 0.5, seed: frame % 24 })]} showInTimeline={false} />;
};

export const Minute: React.FC = () => {
  const { width, height } = useVideoConfig();
  const world = <World />;
  return (
    <AbsoluteFill style={{ background: '#e6e6e8', overflow: 'hidden' }}>
      <style>{FONT}</style>
      <Backgrounds />
      {isHtmlInCanvasSupported()
        ? <HtmlInCanvasMotionBlur width={width} height={height} samples={MOTION_BLUR_SAMPLES} shutterAngle={180} showInTimeline={false}>{world}</HtmlInCanvasMotionBlur>
        : <FallbackBlur>{world}</FallbackBlur>}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 72% 68% at 50% 50%,rgba(0,0,0,0) 45%,rgba(0,0,0,.42) 100%)' }} />
      <Track name="Засветы">
        <LightLeak name="Засвет: почему не PS5" from={1078} durationInFrames={60} seed={1} hueShift={0} />
        <LightLeak name="Засвет: должна ли" from={1847} durationInFrames={60} seed={3} hueShift={200} />
        <LightLeak name="Засвет: Sony" from={2699} durationInFrames={60} seed={5} hueShift={20} />
      </Track>
      <Grain />
      <Track name="Озвучка">
        <Audio name="Голос" src={staticFile('voice.wav')} />
      </Track>
      <Track name="Звуки переходов">
        <Audio name="Вжух 4.24" src={staticFile('sfx/whoosh.wav')} from={236} volume={0.35} />
        <Audio name="Вжух 10.05" src={staticFile('sfx/whoosh.wav')} from={585} volume={0.35} />
        <Audio name="Вжух 13.59" src={staticFile('sfx/whoosh.wav')} from={797} volume={0.35} />
        <Audio name="Вжух 18.27" src={staticFile('sfx/whoosh.wav')} from={1078} volume={0.35} />
        <Audio name="Вжух 21.38" src={staticFile('sfx/whoosh.wav')} from={1265} volume={0.35} />
        <Audio name="Вжух 31.08" src={staticFile('sfx/whoosh.wav')} from={1847} volume={0.35} />
        <Audio name="Вжух 34.88" src={staticFile('sfx/whoosh.wav')} from={2075} volume={0.35} />
        <Audio name="Вжух 39.08" src={staticFile('sfx/whoosh.wav')} from={2327} volume={0.35} />
        <Audio name="Вжух 45.28" src={staticFile('sfx/whoosh.wav')} from={2699} volume={0.35} />
        <Audio name="Вжух 52.18" src={staticFile('sfx/whoosh.wav')} from={3113} volume={0.35} />
      </Track>
    </AbsoluteFill>
  );
};
