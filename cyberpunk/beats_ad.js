// =====================================================================
//   ПОДВОДКА К ИНТЕГРАЦИИ GGSEL (первые ~15.2 с; дальше — запись экрана)
//   T — время начала интеграции в общем ролике
// =====================================================================
const GGSEL = (h = 140) => `<div style="display:flex;align-items:center;gap:${h * 0.16}px;font-family:Mont;font-weight:900;font-size:${h}px;line-height:1;color:#1b1b1e;letter-spacing:-.03em;padding:${h * 0.28}px ${h * 0.45}px;border-radius:${h * 0.3}px;background:#fff">
 <svg width="${h * 0.95}" height="${h * 0.95}" viewBox="0 0 100 100"><path d="M80 30 L50 13 L19 31 V69 L50 87 L81 69 V51 H53" fill="none" stroke="#3dcd58" stroke-width="17" stroke-linejoin="round" stroke-linecap="round"/></svg><span style="margin-top:-${h * 0.12}px">ggsel</span></div>`;
const CPTILE = `<div style="width:620px;height:360px;border-radius:30px;background:#fcee0a;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Osw;font-weight:700;color:#111;line-height:.9;overflow:hidden;position:relative">
 <div style="font-size:96px;letter-spacing:.02em">CYBERPUNK</div><div style="font-size:70px;color:#00b7ff">2077</div>
 <div class="gl" style="position:absolute;left:0;right:0;height:26px;background:rgba(0,183,255,.55);mix-blend-mode:multiply"></div></div>`;
const glUpd = (t, d) => { const g = d.querySelector('.gl'); const f = Math.floor(t * 12); g.style.top = ((rnd(f, 1) * 330) | 0) + 'px'; g.style.opacity = rnd(f, 2) > 0.4 ? 1 : 0; d.style.transform += ` translateX(${((rnd(f, 3) - 0.5) * (rnd(f, 4) > 0.7 ? 18 : 0)).toFixed(1)}px)`; };
const SALE = (txt, bg) => `<div style="padding:14px 30px;border-radius:22px;background:${bg};color:#fff;font-family:Osw;font-weight:700;font-size:80px;transform:rotate(-6deg)">${txt}</div>`;

function AD(T) {
  const A = (p, k = 0) => at(p, T, k);
  // «Кстати, о Rockstar»
  beat(T, 'grid', (g) => {
    g.prop('/gta4_ps3/assets/rockstar.png', 300, T + 0.1, 0, -20, { from: [0, 220], r: -5, float: 6 });
    g.cap('КСТАТИ, О ROCKSTAR', 90, A('rockstar'), 0, 280, { cps: 30, r: 0 });
  }, { keys: [[T, 1.4, 0, 0, 1.08]] });
  // «пока одни студии разбираются с последствиями спешки»
  beat(A('пока') - 0.1, DI('/rdr2/assets/pcb.jpg'), (g) => {
    g.el('', CPTILE, A('студии'), -260, -20, { from: [0, 220], r: -3, float: 5, upd: glUpd });
    ['🐛', '💥', '🐞'].forEach((e, i) => g.emo(e, 120, A('разбираются') + i * 0.18, 260 + i * 170, -230 + (i % 2) * 120, { float: 8 }));
    g.el('', PLATE('СПЕШКА', '#fff', RED), A('спешки'), 420, 200, { from: [0, 140], float: 4 });
  });
  // «Rockstar свою главную игру десятилетия уже почти довела до релиза»
  beat(A('rockstar', 1) - 0.15, 'grid', (g) => {
    g.prop('/gta4_ps3/assets/rockstar.png', 230, A('rockstar', 1), -520, -40, { r: -6, float: 6 });
    g.cap('ГЛАВНАЯ ИГРА', 120, A('главную'), 180, -120, { cps: 24 });
    g.cap('ДЕСЯТИЛЕТИЯ', 120, A('десятилетия'), 180, 30, { cps: 24, col: RED });
    g.el('', GROW('ДО РЕЛИЗА', '#2bb673'), A('довела'), 180, 220, { from: [0, 80], upd: growUpd(A('довела'), 1.2, 0.92) });
  });
  // «ГТА 6 уже на подходе»
  beat(at('г', A('релиза')) - 0.2, 'dark:/cyberpunk/clips/gta6/0040.jpg', (g) => {
    g.card({ w: 1100, h: 619, clip: 'cyberpunk/clips/gta6', n: 180 }, at('г', A('релиза')) - 0.1, -120, 20, { from: [0, 220], r: -2, float: 4 });
    g.cap('ГТА 6', 200, at('6', A('релиза')), 600, -230, { cps: 12, r: 4 });
    g.el('', PLATE('УЖЕ НА ПОДХОДЕ', '#fff', RED), A('подходе'), 560, 260, { from: [0, 140], float: 4, z: 5 });
  }, { keys: [[A('подходе'), 1.0, 60, 0, 1.06]] });
  // «а в PlayStation стартовала большая распродажа»
  beat(A('playstation') - 0.15, DI('/rdr2/assets/blue.jpg'), (g) => {
    g.prop('/rdr2/assets/ps4_front.png', 260, A('playstation'), -60, 180, { from: [0, 220], float: 5 });
    g.cap('РАСПРОДАЖА', 150, A('стартовала'), -60, -170, { cps: 22 });
    g.el('', SALE('−75%', '#2a6cff'), A('большая'), -640, -300, { shadow: true, from: [-200, 0], float: 8 });
    g.el('', SALE('−95%', RED), A('распродажа'), 600, -300, { from: [200, 0], float: 8 });
    g.emo('🔥', 140, A('распродажа') + 0.2, 640, 160, { float: 9 });
  });
  // «Пополнить PSN выгодно можно на ggsel» → наезд на логотип, дальше — запись сайта
  beat(A('пополнить') - 0.15, 'grid', (g) => {
    g.cap('ПОПОЛНИТЬ PSN ВЫГОДНО', 100, A('пополнить'), 0, -260, { cps: 32 });
    g.el('', GGSEL(150), A('выгодно') - 0.1, 0, 60, { from: [0, 200], float: 3 });
  }, { keys: [[A('выгодно') + 0.15, 0.85, 0, 60, 1.75]] });
}
