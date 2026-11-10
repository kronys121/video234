// Первые ~31 с TLOU2 в монтаже «как в референсе» (движок v3).
import React, { createContext, useContext } from 'react';
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { P, T, INK, RED, at, clamp, enter, inOut, lerp, outCubic } from './engine';

export const SEC = 31.1;
const useT = () => { const f = useCurrentFrame(); const { fps } = useVideoConfig(); return f / fps; };
const FONT = `
@font-face{font-family:'Mont';font-weight:800;src:url('${staticFile('fonts/mont-cyrillic.woff2')}') format('woff2');unicode-range:U+0400-045F}
@font-face{font-family:'Mont';font-weight:800;src:url('${staticFile('fonts/mont-latin.woff2')}') format('woff2');unicode-range:U+0000-00FF,U+2000-206F}
@font-face{font-family:'Emoji';src:url('${staticFile('fonts/NotoColorEmoji.ttf')}') format('truetype')}`;

// ---------- элементы ----------
// Ctx: смещение сцены на холсте, конец сцены (для правила «минимум 2 с на экране») и слой, который сейчас рисуется
const Ctx = createContext({ ox: 0, oy: 0, t0: 0, end: 1e9, layer: 'base' as 'base' | 'focus' });
type El = { at: number; x: number; y: number; r?: number; focus?: boolean; from?: [number, number]; until?: number; z?: number };

const Item: React.FC<El & { shadow?: boolean; children: React.ReactNode }> = ({ at: a0, x, y, r = 0, focus, from, until, z, shadow = true, children }) => {
  const t = useT(); const c = useContext(Ctx);
  if ((focus ? 'focus' : 'base') !== c.layer) return null;
  const a = Math.min(a0, Math.max(c.t0 + 0.2, c.end - T.hold)); // не появляться в самом конце сцены
  const e = enter(t, a, { from });
  const out = until ? inOut(P(t, until, 0.4)) : 0;
  const fl = Math.sin((t - a) * 1.1 + x * 0.01) * 5; // лёгкое «дыхание»
  return (
    <div style={{ position: 'absolute', left: c.ox + x, top: c.oy + y, zIndex: z, opacity: e.opacity * (1 - out),
      transform: `translate(-50%,-50%) translate(${e.dx.toFixed(1)}px,${(e.dy + fl + out * 120).toFixed(1)}px) rotate(${(r + e.rot).toFixed(2)}deg) scale(${(e.scale * (1 - 0.1 * out)).toFixed(4)})`,
      filter: shadow ? 'drop-shadow(0 26px 28px rgba(0,0,0,.28))' : undefined }}>{children}</div>
  );
};

const Clip: React.FC<El & { clip: string; n: number; w: number }> = ({ clip, n, w, ...el }) => {
  const t = useT(); const k = Math.floor(Math.max(0, t - el.at) * 30) % n + 1;
  return <Item shadow={false} {...el}><div style={{ width: w, height: Math.round(w * 9 / 16), borderRadius: 34, overflow: 'hidden', background: '#222', boxShadow: '0 30px 60px rgba(0,0,0,.28)' }}>
    <Img src={staticFile(`clips/${clip}/${String(k).padStart(4, '0')}.jpg`)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /></div></Item>;
};
const Pic: React.FC<El & { src: string; h: number; card?: boolean }> = ({ src, h, card, ...el }) => (
  <Item shadow={!card} {...el}><Img src={staticFile(`img/${src}`)} style={{ height: h, display: 'block', borderRadius: card ? 14 : 0, boxShadow: card ? '0 30px 50px rgba(0,0,0,.35)' : undefined }} /></Item>
);
const Emo: React.FC<El & { ch: string; size: number }> = ({ ch, size, ...el }) => (
  <Item from={[0, 80]} {...el}><div style={{ fontFamily: 'Emoji', fontSize: size, lineHeight: 1 }}>{ch}</div></Item>
);
// подпись: печатается по буквам, последняя буква мягко проявляется (как в референсе)
const Cap: React.FC<{ text: string; at: number; x: number; y: number; size?: number; color?: string; focus?: boolean; cps?: number }> = ({ text, at: a0, x, y, size = 58, color = INK, focus, cps = 26 }) => {
  const t = useT(); const c = useContext(Ctx);
  if ((focus ? 'focus' : 'base') !== c.layer) return null;
  const a = Math.min(a0, Math.max(c.t0 + 0.2, c.end - T.hold));
  if (t < a) return null;
  return (
    <div style={{ position: 'absolute', left: c.ox + x, top: c.oy + y, transform: 'translate(-50%,-50%)', zIndex: 20, fontFamily: 'Mont', fontWeight: 800, fontSize: size, color, whiteSpace: 'nowrap', letterSpacing: '-.01em',
      textShadow: color === '#fff' ? '0 6px 24px rgba(0,0,0,.55)' : undefined }}>
      {[...text].map((ch, i) => <span key={i} style={{ opacity: clamp((t - a - i / cps) / 0.16) }}>{ch}</span>)}
    </div>
  );
};

// ---------- сцены ----------
// Группа = один холст. Сцены внутри группы стоят рядом (ox, oy), камера плавно переезжает между ними.
// Между группами — растворение. focus: [от, до] — в это время сцена размыта, а элементы с пометкой focus лежат поверх.
type Scene = { t0: number; ox: number; oy: number; z?: number; body: (t0: number, w: (p: string, k?: number) => number) => React.ReactNode };
type Group = { t0: number; bg: 'grid' | 'art'; scenes: Scene[]; focus?: [number, number][] };

const GROUPS: Group[] = [
  // «The Last of Us Part 2 на PS4 — одна из самых впечатляющих игр целого поколения»
  { t0: 0, bg: 'art', scenes: [{ t0: 0, ox: 0, oy: 0, body: (t, w) => <>
    <Pic card src="cover_ps4.jpg" h={520} at={0.05} x={-40} y={-40} r={-3} />
    <Pic src="ps4.png" h={300} at={w('ps4')} x={-420} y={60} from={[-320, 60]} z={-1} />
    <Cap text="ОДНА ИЗ САМЫХ ВПЕЧАТЛЯЮЩИХ" at={w('одна')} x={0} y={330} size={44} />
  </> }] },
  // «Живые города… враги… собаки… и звук» → фокус: «на консоли, которой было уже семь лет»
  { t0: 4.24, bg: 'grid', focus: [[10.05, 13.59 + 1]], scenes: [
    { t0: 4.24, ox: 0, oy: 0, body: (t, w) => <>
      <Clip clip="city1" n={240} w={900} at={t + 0.05} x={0} y={30} r={-2} />
      <Cap text="Живые города" at={w('живые')} x={0} y={-290} />
    </> },
    { t0: at('враги', 4.24) - 0.45, ox: 0, oy: 760, z: 0.94, body: (t, w) => <>
      <Clip clip="enemy1" n={240} w={760} at={t + 0.2} x={-420} y={0} r={-2} from={[-200, 320]} />
      <Clip clip="dogsniff" n={240} w={760} at={w('собаки')} x={420} y={20} r={2} from={[200, 320]} />
      <Cap text="Враги зовут друг друга по именам" at={w('зовут')} x={-420} y={-270} size={40} />
      <Cap text="Собаки идут по следу" at={w('идущие')} x={420} y={-250} size={40} />
      <Emo ch="🔊" size={130} at={w('звук')} x={0} y={300} />
      <Pic focus src="ps4.png" h={420} at={10.05} x={0} y={-20} from={[-80, 520]} />
      <Cap focus text="7 ЛЕТ" at={w('семь')} x={0} y={250} size={84} color="#fff" cps={12} />
    </> },
  ] },
  // «всего через несколько месяцев вышла PS5» → фокус: «Так почему Naughty Dog не выпустила игру сразу на новой консоли?»
  { t0: 13.59, bg: 'grid', focus: [[18.27, 21.38 + 1]], scenes: [{ t0: 13.59, ox: 0, oy: 0, body: (t, w) => <>
    <Pic card src="cover_ps4.jpg" h={470} at={t + 0.05} x={-380} y={20} r={-3} />
    <Cap text="Через несколько месяцев…" at={w('несколько')} x={0} y={-330} />
    <Pic src="ps5.png" h={560} at={w('ps5')} x={360} y={20} from={[240, 320]} />
    <Pic focus src="nd_logo.png" h={150} at={at('naughty', 18.27) - 0.1} x={0} y={-60} from={[0, 460]} />
    <Cap focus text="Почему не сразу на PS5?" at={at('не', 18.27)} x={0} y={130} size={64} color="#fff" />
  </> }] },
  // «работа началась ещё в 2014 году… шесть лет выжимать всё из того железа, которое было»
  { t0: 21.38, bg: 'grid', scenes: [
    { t0: 21.38, ox: 0, oy: 0, body: (t, w) => <>
      <Clip clip="t_hands" n={240} w={820} at={t + 0.05} x={0} y={40} r={2} />
      <Cap text="Работа началась в 2014 году" at={w('работа')} x={0} y={-270} />
    </> },
    { t0: at('тогда', 21.38) - 0.4, ox: 1750, oy: 0, body: (t, w) => <>
      <Pic src="ps4.png" h={400} at={t + 0.25} x={0} y={-40} from={[200, 320]} />
      <Cap text="6 лет на одном железе" at={w('шесть')} x={0} y={260} />
      <Emo ch="🥵" size={120} at={w('выжимать')} x={360} y={-200} />
    </> },
  ] },
];
GROUPS.forEach((g) => g.scenes.forEach((s) => { if (s.z === undefined) s.z = 1; }));

// камера группы: стоит на сцене, плавно переезжает к следующей; всё время чуть наезжает и «дышит»
function camOf(g: Group, t: number) {
  let x = g.scenes[0].ox, y = g.scenes[0].oy, z = g.scenes[0].z!;
  for (const s of g.scenes.slice(1)) { const k = inOut(P(t, s.t0, T.pan)); x = lerp(x, s.ox, k); y = lerp(y, s.oy, k); z = lerp(z, s.z!, k); }
  const cur = [...g.scenes].reverse().find((s) => t >= s.t0) || g.scenes[0];
  const push = 0.05 * (1 - Math.exp(-(t - cur.t0) / 5)); // медленный наезд, затухает
  return { x: x + Math.sin(t * 0.5) * 8, y: y + Math.cos(t * 0.4) * 6, z: z * (1 + push) };
}

const Layer: React.FC<{ g: Group; end: number; layer: 'base' | 'focus' }> = ({ g, end, layer }) => {
  const t = useT(); const c = camOf(g, t);
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, transformOrigin: '0 0',
      transform: `translate(960px,540px) perspective(2200px) rotateX(${(Math.cos(t * 0.21) * 2.2).toFixed(3)}deg) rotateY(${(Math.sin(t * 0.17) * 3.6).toFixed(3)}deg) scale(${c.z.toFixed(4)}) translate(${(-c.x).toFixed(1)}px,${(-c.y).toFixed(1)}px)` }}>
      {g.scenes.map((s, i) => { const e = g.scenes[i + 1]?.t0 ?? end; return (
        <Ctx.Provider key={i} value={{ ox: s.ox, oy: s.oy, t0: s.t0, end: e, layer }}>{s.body(s.t0, (p, k = 0) => at(p, s.t0, k))}</Ctx.Provider>
      ); })}
    </div>
  );
};

const GroupView: React.FC<{ g: Group; end: number; first: boolean }> = ({ g, end, first }) => {
  const t = useT(); const c = camOf(g, t);
  if (t < g.t0 - 0.05 || t > end + T.dissolve + 0.05) return null;
  const op = first ? 1 : inOut(P(t, g.t0, T.dissolve));
  const f = Math.max(0, ...(g.focus || []).map(([a, b]) => inOut(P(t, a, T.focus)) * (1 - inOut(P(t, b, T.focus)))));
  const gs = 96 * c.z;
  return (
    <AbsoluteFill style={{ opacity: op }}>
      <AbsoluteFill style={{ filter: f > 0.01 ? `blur(${(f * 16).toFixed(1)}px) brightness(${(1 - 0.42 * f).toFixed(3)}) saturate(${(1 - 0.3 * f).toFixed(3)})` : undefined }}>
        <div style={{ position: 'absolute', inset: -60, background: '#f5f5f6',
          backgroundImage: 'linear-gradient(rgba(0,0,0,.035) 2px,transparent 2px),linear-gradient(90deg,rgba(0,0,0,.035) 2px,transparent 2px)',
          backgroundSize: `${gs.toFixed(2)}px ${gs.toFixed(2)}px`, backgroundPosition: `${(960 - c.x * c.z).toFixed(1)}px ${(540 - c.y * c.z).toFixed(1)}px` }} />
        {g.bg === 'art' && <Img src={staticFile('bg_forest.jpg')} style={{ position: 'absolute', inset: -40, width: 2000, height: 1160, objectFit: 'cover', opacity: 0.3, filter: 'blur(3px) saturate(.7)', transform: `scale(${(1.02 + (t - g.t0) * 0.006).toFixed(4)})` }} />}
        <Layer g={g} end={end} layer="base" />
      </AbsoluteFill>
      <Layer g={g} end={end} layer="focus" />
    </AbsoluteFill>
  );
};

export const Video: React.FC = () => (
  <AbsoluteFill style={{ background: '#f5f5f6', overflow: 'hidden' }}>
    <style>{FONT}</style>
    {GROUPS.map((g, i) => <GroupView key={i} g={g} end={GROUPS[i + 1]?.t0 ?? SEC + 1} first={i === 0} />)}
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse 75% 70% at 50% 50%,rgba(0,0,0,0) 50%,rgba(0,0,0,.30) 100%)' }} />
    <Audio src={staticFile('voice.wav')} />
  </AbsoluteFill>
);
export { RED, outCubic };
