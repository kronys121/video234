// =====================================================================
//   ИНТЕГРАЦИЯ GGSEL для TLOU2 — графика на подводку (0–11.2 с, дальше запись сайта)
// =====================================================================
const WF = (() => { const d = document.createElement('div'); d.style.cssText = 'position:absolute;inset:0;background:#fff;opacity:0;z-index:50;pointer-events:none'; document.getElementById('view').appendChild(d); return d; })();
const GGSEL = (h = 140) => `<div style="display:flex;align-items:center;gap:${h * 0.16}px;font-family:Mont;font-weight:900;font-size:${h}px;line-height:1;color:#1b1b1e;letter-spacing:-.03em;padding:${h * 0.28}px ${h * 0.45}px;border-radius:${h * 0.3}px;background:#fff">
 <svg width="${h * 0.95}" height="${h * 0.95}" viewBox="0 0 100 100"><path d="M80 30 L50 13 L19 31 V69 L50 87 L81 69 V51 H53" fill="none" stroke="#3dcd58" stroke-width="17" stroke-linejoin="round" stroke-linecap="round"/></svg><span style="margin-top:-${h * 0.12}px">ggsel</span></div>`;
const SALE = (txt, bg) => `<div style="padding:14px 30px;border-radius:22px;background:${bg};color:#fff;font-family:Osw;font-weight:700;font-size:80px;transform:rotate(-6deg)">${txt}</div>`;
CL.gta6 = ['tlou2/clips/gta6', 146];
const AW = (p, k = 0) => at(p, 0, k);

// «Кстати, об играх, которые выжимают из консоли всё»
beat(0, 'grid', (g) => {
  g.prop(RA('ps4.png'), 330, 0.1, -400, 40, { float: 5 });
  g.cap('ВЫЖИМАЮТ ВСЁ', 120, AW('выжимают'), 300, -200, { cps: 24 });
  g.el('', GROW('НАГРУЗКА', RED), AW('консоли'), 330, 60, { from: [0, 80], upd: growUpd(AW('консоли'), 0.7, 1) });
  g.emo('🥵', 140, AW('всё'), 560, 280, { float: 8 });
}, { keys: [[0, 1.6, 0, 0, 1.04]] });

// «следующая такая игра — GTA VI, и она уже на подходе»
beat(AW('следующая') - 0.1, DI('/tlou2/clips/gta6/0040.jpg'), (g) => {
  g.card({ w: 1100, h: 619, clip: 'tlou2/clips/gta6', n: 146 }, AW('следующая'), -120, 20, { from: [0, 220], r: -2, float: 4 });
  g.cap('GTA VI', 200, AW('gta'), 520, -230, { cps: 12, r: 4 });
  g.el('', PLATE('УЖЕ НА ПОДХОДЕ', '#fff', RED), AW('подходе'), 380, 280, { from: [0, 140], float: 4, z: 5 });
}, { keys: [[AW('подходе'), 1.0, 0, 20, 1.04]] });

// «а в PlayStation как раз стартовала одна из крупных распродаж»
beat(AW('playstation') - 0.2, DI(RA('blue.jpg')), (g) => {
  g.prop('/cyberpunk/assets/ps5.png', 760, AW('playstation'), 420, 40, { from: [0, 300], float: 5 });
  g.cap('РАСПРОДАЖА', 150, AW('стартовала'), -380, -150, { cps: 22 });
  g.el('', SALE('−75%', '#2a6cff'), AW('крупных'), -590, 90, { from: [-200, 0], float: 8 });
  g.el('', SALE('−95%', RED), AW('распродаж'), -200, 160, { from: [-200, 0], float: 8 });
  g.emo('🔥', 140, AW('распродаж') + 0.2, -400, 340, { float: 9 });
});

// «самое время выгодно пополнить баланс PSN на ggsel» — логотип, затем уход в белый (сайт начинается с белого)
beat(AW('самое') - 0.1, 'grid', (g) => {
  g.cap('ПОПОЛНИТЬ PSN ВЫГОДНО', 100, AW('выгодно'), 0, -250, { cps: 34, r: 0, until: 20 });
  g.el('', GGSEL(190), AW('баланс'), 0, 80, { from: [0, 420], dur: 0.55, float: 3 });
  (window.GFX = window.GFX || []).push((t) => { WF.style.opacity = t >= 10.77 ? E.inOut(P(t, 10.77, 0.43)).toFixed(3) : 0; });
}, { z: 1.1 });
