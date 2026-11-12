// =====================================================================
//   ИНТЕГРАЦИЯ GGSEL для GTA San Andreas — графика на подводку (0–15.57 с, дальше запись сайта)
// =====================================================================
const WF = (() => { const d = document.createElement('div'); d.style.cssText = 'position:absolute;inset:0;background:#fff;opacity:0;z-index:50;pointer-events:none'; document.getElementById('view').appendChild(d); return d; })();
const GGSEL = (h = 140) => `<div style="display:flex;align-items:center;gap:${h * 0.16}px;font-family:Mont;font-weight:900;font-size:${h}px;line-height:1;color:#1b1b1e;letter-spacing:-.03em;padding:${h * 0.28}px ${h * 0.45}px;border-radius:${h * 0.3}px;background:#fff">
 <svg width="${h * 0.95}" height="${h * 0.95}" viewBox="0 0 100 100"><path d="M80 30 L50 13 L19 31 V69 L50 87 L81 69 V51 H53" fill="none" stroke="#3dcd58" stroke-width="17" stroke-linejoin="round" stroke-linecap="round"/></svg><span style="margin-top:-${h * 0.12}px">ggsel</span></div>`;
const SALE = (txt, bg) => `<div style="padding:14px 30px;border-radius:22px;background:${bg};color:#fff;font-family:Osw;font-weight:700;font-size:80px;transform:rotate(-6deg)">${txt}</div>`;
CL.gta6 = ['tlou2/clips/gta6', 146];
const AW = (p, k = 0) => at(p, 0, k);

CL.safog = ['gta_sa/clips/fog', 240];
const SA = (n) => '/gta_sa/assets/' + n;

// «Кстати, о том, где кончается мир. В San Andreas его прятали в тумане»
beat(0, DI('/gta_sa/clips/fog/0120.jpg'), (g) => {
  g.card({ w: 900, h: 506, clip: 'gta_sa/clips/fog', n: 240 }, 0.1, -360, 40, { from: [0, 220], r: -2, float: 4 });
  g.cap('ГДЕ КОНЧАЕТСЯ МИР?', 96, AW('кончается'), 0, -400, { cps: 30, r: 0, col: '#fff' });
  g.card({ w: 420, h: 420, src: SA('map.jpg') }, AW('санадрес'), 520, -10, { from: [200, 0], r: 3, float: 4 });
  g.el('', PLATE('ТУМАН', '#fff', RED), AW('тумане'), 520, 270, { from: [0, 140], float: 4, z: 5 });
  g.emo('🌫️', 120, AW('тумане') + 0.15, 760, 200, { float: 8 });
}, { keys: [[0, 2.4, 0, 0, 1.05]] });

// «а следующая игра от Rockstar обещает мир, до края которого так просто не доедешь»
beat(AW('следующая') - 0.15, DI(RA('blue.jpg')), (g) => {
  g.prop(SA('rockstar.png'), 380, AW('рукстар'), -420, 0, { r: -6, float: 6 });
  g.cap('МИР БЕЗ КРАЯ', 130, AW('обещает'), 300, -120, { cps: 22 });
  g.emo('🌍', 150, AW('края'), 300, 120, { float: 8 });
  g.emo('🚗', 110, AW('доедешь'), 520, 170, { float: 6 });
});

// «Это GTA VI, и она уже на подходе»
beat(AW('это') - 0.1, DI('/tlou2/clips/gta6/0040.jpg'), (g) => {
  g.card({ w: 1100, h: 619, clip: 'tlou2/clips/gta6', n: 146 }, AW('это'), -120, 20, { from: [0, 220], r: -2, float: 4 });
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
  g.cap('ПОПОЛНИТЬ PSN ВЫГОДНО', 100, AW('выгодно'), 0, -250, { cps: 34, r: 0, until: 24 });
  g.el('', GGSEL(190), AW('баланс'), 0, 80, { from: [0, 420], dur: 0.55, float: 3 });
  (window.GFX = window.GFX || []).push((t) => { WF.style.opacity = t >= 15.14 ? E.inOut(P(t, 15.14, 0.43)).toFixed(3) : 0; });
}, { z: 1.1 });
