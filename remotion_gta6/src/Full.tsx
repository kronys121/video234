// Весь ролик GTA 6 на PS5 + реклама ggsel в 2:54,9. 60 кадров в секунду.
// Сцены рисует движок монтажа (public/site/gta6) — Remotion на каждом кадре просит его нарисовать нужный момент
// (window.renderAt) и снимает кадр. Звук — готовый микс: голос, музыка, эффекты и звук рекламы.
import React, { useEffect, useRef, useState } from 'react';
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';

export const FPS = 60;
const MAIN_SEC = 658.8;            // длина ролика без рекламы (по озвучке)
const AD_FROM = 10492;             // 174,867 с — после «…как это было с RDR2», перед «Ещё со времён GTA 4…»
const AD_LEN = 2297;               // 38,29 с — подводка + основной блок ggsel
const MAIN_LEN = Math.round(MAIN_SEC * FPS);
export const TOTAL_FRAMES = MAIN_LEN + AD_LEN;

type EngineWindow = Window & { __ready?: boolean; renderAt?: (t: number) => Promise<void> };

const Engine: React.FC = () => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLIFrameElement>(null);
  const [loaded] = useState(() => delayRender('загрузка движка', { timeoutInMilliseconds: 240000 }));
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

  return <iframe ref={ref} src={staticFile('site/gta6/index.html')} style={{ width: 1920, height: 1080, border: 0, visibility: inAd ? 'hidden' : 'visible' }} />;
};

export const Full: React.FC = () => (
  <AbsoluteFill style={{ background: '#000' }}>
    <Engine />
    {/* реклама ggsel: готовый отрезок (звук рекламы уже в общем миксе) */}
    <Sequence from={AD_FROM} durationInFrames={AD_LEN}>
      <OffthreadVideo src={staticFile('media/gta6_ggsel.mp4')} muted style={{ width: 1920, height: 1080 }} />
    </Sequence>
    {/* звук: голос + музыка + эффекты + реклама, одной дорожкой */}
    <Audio src={staticFile('media/mix.m4a')} />
  </AbsoluteFill>
);
