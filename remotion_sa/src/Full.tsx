// Весь ролик GTA San Andreas + реклама ggsel в 2:53.
// Сцены рисует исходный движок v2 (public/site/tlou2) — ровно как в прошлых роликах.
// Remotion на каждом кадре просит движок нарисовать нужный момент (window.renderAt) и снимает его.
import React, { useEffect, useRef, useState } from 'react';
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';

export const FPS = 60;
const MAIN_SEC = 475.0;            // длина ролика без рекламы
const AD_AT = 173.09;              // 2:53 — после «…способ спрятать, где кончается мир», перед «С машинами и людьми…»
const AD_SEC = 41.703;             // длина отрезка с рекламой
const AD_FROM = Math.round(AD_AT * FPS), AD_LEN = Math.round(AD_SEC * FPS), MAIN_LEN = Math.round(MAIN_SEC * FPS);
export const TOTAL_FRAMES = MAIN_LEN + AD_LEN;

type EngineWindow = Window & { __ready?: boolean; renderAt?: (t: number) => Promise<void> };

// окно с движком: грузится один раз, дальше на каждый кадр вызывается renderAt(время ролика)
const Engine: React.FC = () => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLIFrameElement>(null);
  const [loaded] = useState(() => delayRender('загрузка движка', { timeoutInMilliseconds: 180000 }));
  const [ok, setOk] = useState(false);
  const inAd = frame >= AD_FROM && frame < AD_FROM + AD_LEN;
  const t = (frame < AD_FROM ? frame : frame - AD_LEN) / FPS;

  useEffect(() => {
    const id = setInterval(() => { const w = ref.current?.contentWindow as EngineWindow | null; if (w?.__ready) { clearInterval(id); setOk(true); continueRender(loaded); } }, 50);
    return () => clearInterval(id);
  }, [loaded]);

  useEffect(() => {
    if (!ok || inAd) return;
    const h = delayRender(`кадр ${frame}`, { timeoutInMilliseconds: 120000 });
    (ref.current!.contentWindow as EngineWindow).renderAt!(t).then(() => requestAnimationFrame(() => continueRender(h)));
  }, [ok, frame, inAd, t]);

  return <iframe ref={ref} src={staticFile('site/gta_sa/gta_sa.html')} style={{ width: 1920, height: 1080, border: 0, visibility: inAd ? 'hidden' : 'visible' }} />;
};

export const Full: React.FC = () => (
  <AbsoluteFill style={{ background: '#000' }}>
    <Engine />
    {/* реклама ggsel: готовый отрезок со своим звуком */}
    <Sequence from={AD_FROM} durationInFrames={AD_LEN}>
      <OffthreadVideo src={staticFile('media/gta_sa_ggsel.mp4')} style={{ width: 1920, height: 1080 }} />
    </Sequence>
    {/* голос: до рекламы и после неё (без обрезки) */}
    <Sequence from={0} durationInFrames={AD_FROM}><Audio src={staticFile('media/voice.mp3')} /></Sequence>
    <Sequence from={AD_FROM + AD_LEN}><Audio src={staticFile('media/voice.mp3')} trimBefore={AD_FROM} /></Sequence>
  </AbsoluteFill>
);
