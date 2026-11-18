// Сцены ролика GTA 6 (время — секунды озвучки). Стиль референса: светлая студия, вырезки, иконки, подписи, геймплей в карточках.
const L = 'light', D = 'dark';
const BL = (clip, off = 0) => ({ blur: clip, off });
const DK = (clip, off = 0) => ({ blur: clip, off, dark: true });
const FULL = (clip, off = 0) => ({ full: clip, off });
const RED = '#e1252d', GREEN = '#2fbf4a', GOLD = '#f5b40f', BLUE = '#1f6feb', WHITE = '#ffffff';
const T = (text, at, o = {}) => TXT(text, Object.assign({ at, y: 900, size: 64 }, o));
const C = (clip, at, o = {}) => CARD(clip, Object.assign({ at, w: 1000, enter: 'zoom' }, o));
const I = (src, at, o = {}) => IMG(src, Object.assign({ at, float: 6 }, o));
const M = (ch, at, o = {}) => EMO(ch, Object.assign({ at, float: 5 }, o));
const icoX = (n, size, gap, i, cx = 960) => cx - (n * size + (n - 1) * gap) / 2 + size / 2 + i * (size + gap);

// ===== ВСТУПЛЕНИЕ =====
SC(0.00, BL('keys_aerial2'),
  I('jason.png', 0.05, { x: 470, y: 600, w: 470, enter: 'left' }),
  I('lucia.png', 0.20, { x: 1450, y: 620, w: 430, enter: 'right' }),
  I('gta6_logo.png', 0.35, { x: 960, y: 470, w: 470, enter: 'zoom', float: 4 }));
SC(1.55, L,
  I('dualsense.png', 1.6, { x: 960, y: 470, w: 640, enter: 'zoom' }),
  T('НЕ ДОЛЖНА БЫЛА РАБОТАТЬ', 2.05, { y: 860, size: 70, ul: true }));
SC(3.16, L,
  I('rockstar.png', 3.3, { x: 640, y: 520, w: 320, enter: 'pop' }),
  T('RAGE', 4.8, { x: 1220, y: 520, size: 220, color: GOLD, weight: 900, enter: 'zoom' }));
SC(5.75, L,
  M('🧠', 5.9, { x: 960, y: 420, size: 230, enter: 'pop' }),
  I('raul.png', 6.4, { x: 420, y: 640, w: 330, enter: 'rise' }),
  I('boobie.png', 6.8, { x: 1500, y: 640, w: 360, enter: 'rise' }),
  T('САМЫЙ ПРОДВИНУТЫЙ ИИ', 6.1, { y: 880, size: 66, ul: true }));
SC(8.70, L,
  C('jason_face2', 8.72, { x: 960, y: 500, w: 1150 }),
  T('БЕЗУМНАЯ ДЕТАЛИЗАЦИЯ', 8.8, { y: 990, size: 58, out: 10.15 }),
  M('💧', 10.3, { x: 1460, y: 300, size: 170, enter: 'drop' }),
  T('ДО КАПЛИ ПОТА', 10.35, { y: 990, size: 58, ul: true }));
SC(11.10, L,
  C('seaplane_gold', 11.12, { x: 700, y: 520, w: 980, enter: 'left' }),
  M('📷', 12.7, { x: 1500, y: 380, size: 200, enter: 'pop' }),
  T('ЛУЧШЕ ЖИЗНИ?', 12.8, { x: 1500, y: 640, size: 64 }));
SC(13.86, L,
  PHOTO('gta6-postcard-vicecity.jpg', 13.9, { x: 620, y: 560, w: 700, rot: -6, enter: 'spin', float: 5 }),
  T('ОГРОМНАЯ КАРТА', 14.0, { x: 620, y: 160, size: 64 }),
  I('gator.png', 15.35, { x: 1430, y: 520, w: 520, enter: 'pop' }));
SC(16.40, L,
  C('beach_crowd', 16.42, { x: 900, y: 520, w: 1100 }),
  ICONS(['🧠', '🧠', '🧠'], { at: 16.6, times: [16.66, 16.98, 17.22], x: 960, y: 960, size: 110, bgc: '#1f2a44' }));
SC(18.26, L,
  I('ps5.png', 18.3, { x: 960, y: 520, w: 330, enter: 'pop' }),
  T('6 ЛЕТ', 19.3, { x: 470, y: 520, size: 130, weight: 900 }),
  NUM(0, 30, { at: 20.3, x: 1460, y: 520, size: 130, suffix: ' FPS', dur: 0.6, color: RED }));
SC(21.66, DK('keys_shore'),
  T('13 ЛЕТ', 23.15, { y: 520, size: 210, color: WHITE, weight: 900, glow: true, enter: 'zoom' }));
SC(24.00, L,
  I('ps5.png', 25.45, { x: 960, y: 480, w: 330, enter: 'pop' }),
  XMARK({ at: 26.4, x: 960, y: 480, size: 430 }),
  T('PS5 ЕЩЁ НЕ БЫЛО', 25.6, { y: 900, size: 66 }));
SC(27.22, L,
  C('storm_sea', 27.25, { x: 720, y: 500, w: 980, enter: 'left' }),
  I('rockstar.png', 27.8, { x: 1500, y: 330, w: 230, enter: 'pop' }),
  M('🖥️', 29.6, { x: 1500, y: 650, size: 190, enter: 'pop' }),
  T('МОЩНЫЕ ПК', 29.7, { x: 720, y: 960, size: 64, ul: true }));
SC(30.60, L,
  T('КОНСОЛЬ БУДУЩЕГО', 30.65, { y: 330, size: 74 }),
  BAR({ at: 31.0, x: 960, y: 560, w: 1000, label: 'NEXT-GEN', from: 0, to: 100, dur: 2.6 }),
  M('❓', 33.0, { x: 960, y: 800, size: 150, enter: 'pop' }));
SC(34.66, DK('seaplane_rise'),
  T('2018 – 2019', 35.45, { y: 520, size: 160, color: WHITE, weight: 900, glow: true, enter: 'zoom' }));
SC(37.32, L,
  I('devkit.png', 37.95, { x: 960, y: 560, w: 1000, enter: 'rise', float: 4 }),
  T('ДЕВКИТЫ PS5', 38.4, { y: 190, size: 80, ul: true }),
  T('RAGE', 40.6, { x: 1560, y: 880, size: 110, color: GOLD, weight: 900, enter: 'pop' }));

// ===== ПОЛИЦИЯ =====
SC(42.20, L,
  I('police_car.png', 43.75, { x: 960, y: 560, w: 860, enter: 'right' }),
  T('ПОЛИЦИЯ', 43.85, { y: 200, size: 110, ul: true }));
SC(44.44, L,
  I('gta5_logo.png', 44.5, { x: 430, y: 520, w: 380, enter: 'pop' }),
  STARS(5, { at: 46.4, x: 1200, y: 520, size: 120, step: 0.09, color: GOLD }),
  T('АВТОМАТИЧЕСКИ', 47.0, { x: 1200, y: 720, size: 56 }));
SC(47.96, L,
  I('gta6_logo.png', 48.0, { x: 330, y: 230, w: 260, enter: 'pop' }),
  I('police_car.png', 48.3, { x: 960, y: 430, w: 720, enter: 'left' }),
  M('👀', 50.15, { x: 720, y: 830, size: 170, enter: 'pop' }),
  M('🚨', 51.0, { x: 1200, y: 830, size: 170, enter: 'pop' }),
  T('СВИДЕТЕЛЬ', 50.2, { x: 720, y: 980, size: 40, weight: 700 }),
  T('СИГНАЛИЗАЦИЯ', 51.05, { x: 1200, y: 980, size: 40, weight: 700 }));
SC(52.38, L,
  STARS(5, { at: 52.45, x: 960, y: 380, size: 140, step: 0.08 }),
  T('ЧТО О ВАС ИЗВЕСТНО', 54.6, { y: 720, size: 72, ul: true }));
SC(56.42, L,
  STARS(5, { at: 56.42, x: 960, y: 320, size: 100, step: 0.03 }),
  ICONS(['👕', '🙂', '👥', '🚗', '📷', '🔫'], { at: 56.8, times: [56.84, 57.46, 58.12, 58.8, 60.12, 61.18], x: 960, y: 620, size: 150 }),
  T('ОДЕЖДА · ЛИЦО · С КЕМ · МАШИНА · КАМЕРА · ОРУЖИЕ', 57.0, { y: 860, size: 38, weight: 700, color: '#444', stag: 0.6 }));
SC(61.86, L,
  C('jeep_steal', 61.9, { x: 760, y: 520, w: 1000, enter: 'left' }),
  M('📍', 63.0, { x: 1560, y: 380, size: 210, enter: 'drop' }),
  T('GPS-ТРЕКЕР', 63.1, { x: 1560, y: 620, size: 64 }),
  M('🚓', 64.6, { x: 1560, y: 820, size: 140, enter: 'pop' }));
SC(67.08, L,
  I('gta5_logo.png', 67.1, { x: 1650, y: 190, w: 230, enter: 'pop' }),
  RING({ at: 67.3, x: 960, y: 560, size: 620 }),
  M('🏃', 68.45, { x: 1450, y: 560, size: 190, enter: 'left' }),
  T('ВЫБРАТЬСЯ ИЗ КРУГА', 68.5, { y: 960, size: 56 }));
SC(69.94, L,
  STARS(5, { at: 70.4, x: 960, y: 360, size: 140, step: 0.07, color: RED }),
  T('ВАС ВСЁ ЕЩЁ ИЩУТ', 71.75, { y: 640, size: 80 }),
  M('❓', 73.2, { x: 960, y: 860, size: 150, enter: 'pop' }));
SC(74.02, L,
  ICONS(['👕', '🙂', '🚗', '📷'], { at: 74.1, step: 0.1, x: 960, y: 480, size: 160 }),
  XMARK({ at: 75.65, x: icoX(4, 160, 24, 0), y: 480, size: 170 }),
  XMARK({ at: 75.95, x: icoX(4, 160, 24, 1), y: 480, size: 170 }),
  XMARK({ at: 76.25, x: icoX(4, 160, 24, 2), y: 480, size: 170 }),
  XMARK({ at: 76.55, x: icoX(4, 160, 24, 3), y: 480, size: 170 }),
  T('ИЗБАВИТЬСЯ ОТ УЛИК', 75.5, { y: 800, size: 64 }));
SC(78.00, L,
  I('jason.png', 78.05, { x: 520, y: 600, w: 400, enter: 'left' }),
  M('😇', 79.3, { x: 820, y: 280, size: 110, enter: 'pop' }),
  M('😈', 79.6, { x: 820, y: 430, size: 110, enter: 'pop' }),
  I('arthur_bust.png', 80.45, { x: 1400, y: 560, w: 420, enter: 'right' }),
  I('rdr2_logo.png', 81.5, { x: 1400, y: 900, w: 380, enter: 'pop' }),
  T('ПРОФИЛЬ', 78.7, { x: 960, y: 140, size: 70 }));
SC(82.38, L,
  C('drift_smoke', 82.4, { x: 820, y: 540, w: 1100 }),
  M('🧠', 82.9, { x: 1630, y: 330, size: 170, enter: 'pop' }),
  XMARK({ at: 84.0, x: 1630, y: 330, size: 200 }));

// ===== NPC =====
SC(85.26, FULL('beach_crowd', 2.3),
  T('ЛЮДИ НА УЛИЦАХ', 86.15, { y: 920, size: 84, color: WHITE, glow: true }));
SC(87.22, L,
  C('vs_beach', 87.25, { x: 960, y: 560, w: 1300 }),
  T('ДЕКОРАЦИЯ', 88.5, { y: 130, size: 76, out: 89.9 }),
  T('ВСЕ ОДИНАКОВЫЕ', 90.0, { y: 130, size: 76, ul: true }));
SC(91.38, L,
  I('rockstar.png', 91.95, { x: 560, y: 470, w: 300, enter: 'pop' }),
  ICONS(['🧑', '👩', '🧔', '👵'], { at: 93.2, step: 0.12, x: 1300, y: 470, size: 130, bgc: '#1f2a44' }),
  T('КОМАНДА ПО NPC', 93.3, { y: 820, size: 76, ul: true }));
SC(95.98, L,
  PHOTO('gta6-screenshot-ocean-drive.jpg', 96.0, { x: 820, y: 520, w: 1100, enter: 'zoom', float: 3 }),
  M('📋', 96.6, { x: 1600, y: 700, size: 220, enter: 'rise' }),
  T('МАЙАМИ', 96.0, { x: 820, y: 120, size: 70 }));
SC(98.56, L,
  C('beach_walk', 98.6, { x: 760, y: 470, w: 1000, enter: 'left' }),
  ICONS(['📏', '💪', '🎨', '🎂'], { at: 99.5, times: [99.58, 99.98, 100.58, 101.24], x: 960, y: 930, size: 120 }),
  T('РАЗНЫЕ', 99.1, { x: 1600, y: 470, size: 76 }));
SC(101.98, L,
  C('beach_people', 102.0, { x: 520, y: 540, w: 820, enter: 'left' }),
  T('ОБГОРЕЛ', 102.2, { x: 520, y: 180, size: 64 }),
  C('beach_crowd3', 103.3, { x: 1400, y: 540, w: 820, enter: 'right' }),
  T('НАКАЧАН', 103.44, { x: 1400, y: 180, size: 64 }),
  M('💪', 103.6, { x: 1700, y: 860, size: 140, enter: 'pop' }));
SC(105.64, L,
  ICONS(['🙂', '👕', '👖', '👟'], { at: 106.9, step: 0.16, x: 960, y: 520, size: 160, bgc: '#1f2a44' }),
  T('ПОМЕЧЕННЫЕ ЧАСТИ', 106.95, { y: 210, size: 72 }),
  M('🧩', 108.0, { x: 960, y: 820, size: 170, enter: 'pop' }));
SC(108.92, D,
  I('gta6_logo.png', 108.95, { x: 600, y: 520, w: 430, enter: 'pop' }),
  NUM(0, 600000, { at: 110.85, x: 1340, y: 480, size: 120, suffix: '+', color: '#ff4d57', dur: 0.8 }),
  T('АНИМАЦИЙ', 111.6, { x: 1340, y: 620, size: 60, color: WHITE }));
SC(112.56, D,
  I('gta5_logo.png', 112.6, { x: 600, y: 520, w: 380, enter: 'pop' }),
  NUM(0, 55000, { at: 113.15, x: 1340, y: 480, size: 120, color: '#ff4d57', dur: 0.6 }),
  T('АНИМАЦИЙ', 113.6, { x: 1340, y: 620, size: 60, color: WHITE }));
SC(115.12, L,
  T('НО ЕСТЬ ПОДВОХ', 115.15, { y: 540, size: 104 }),
  M('🤔', 115.5, { x: 1600, y: 330, size: 150, enter: 'pop' }));
SC(116.00, L,
  CHIP('GPU', { at: 116.1, x: 470, y: 470, size: 300 }),
  C('night_bike1', 116.85, { x: 1260, y: 470, w: 900, enter: 'right' }),
  CHECK({ at: 119.15, x: 470, y: 830, size: 150 }),
  T('ТОЛЬКО ТО, ЧТО ПЕРЕД ВАМИ', 117.5, { x: 1260, y: 860, size: 46 }));
SC(120.52, L,
  CHIP('CPU', { at: 120.7, x: 960, y: 460, size: 340 }),
  T('НЕ СЭКОНОМИШЬ', 121.35, { y: 860, size: 76, color: RED }));
SC(122.36, L,
  C('night_traffic', 122.4, { x: 860, y: 480, w: 1100 }),
  M('🧠', 124.45, { x: 1620, y: 300, size: 170, enter: 'pop' }),
  T('ДАЖЕ ЕСЛИ ВЫ ЕГО НЕ ВИДИТЕ', 125.0, { y: 970, size: 50 }));
SC(126.36, L,
  C('daiquiri', 126.4, { x: 700, y: 520, w: 980, enter: 'left' }),
  ICONS(['🧠', '🧠', '🧠'], { at: 127.9, step: 0.15, x: 1530, y: 300, size: 110, bgc: '#1f2a44' }),
  CHIP('CPU', { at: 130.4, x: 1530, y: 700, size: 240 }),
  T('ТЫСЯЧИ ДУМАЮЩИХ NPC', 127.6, { x: 700, y: 980, size: 46 }));
SC(132.28, L,
  I('ps5.png', 132.35, { x: 960, y: 520, w: 300, enter: 'pop' }),
  T('ЕДИНАЯ ПАМЯТЬ', 133.0, { y: 150, size: 80, ul: true }),
  CHIP('GPU', { at: 136.5, x: 400, y: 560, size: 260 }),
  CHIP('CPU', { at: 137.4, x: 1520, y: 560, size: 260 }),
  ARROW({ at: 136.7, x1: 800, y1: 560, x2: 560, y2: 560, bend: 60 }),
  ARROW({ at: 137.6, x1: 1120, y1: 560, x2: 1360, y2: 560, bend: 60 }),
  T('КОМУ НУЖНЕЕ', 139.2, { y: 930, size: 56 }));

// ===== ЦИФРА / ДИСК =====
SC(140.24, L,
  I('gta6_logo.png', 140.3, { x: 700, y: 480, w: 440, enter: 'pop' }),
  M('📲', 142.9, { x: 1380, y: 480, size: 230, enter: 'pop' }),
  T('ТОЛЬКО В ЦИФРЕ', 142.6, { y: 880, size: 76, ul: true }));
SC(143.76, L,
  M('💿', 144.25, { x: 820, y: 500, size: 300, enter: 'spin' }),
  XMARK({ at: 144.7, x: 820, y: 500, size: 360 }),
  T('БОЛЬШЕ?', 145.85, { x: 1450, y: 500, size: 120, color: RED }));
SC(146.92, L,
  M('💿', 147.1, { x: 430, y: 520, size: 230, enter: 'spin' }),
  ARROW({ at: 148.3, x1: 620, y1: 520, x2: 1020, y2: 520, bend: 80 }),
  T('SSD', 149.3, { x: 1240, y: 520, size: 130, weight: 900 }),
  I('ps5.png', 149.85, { x: 1620, y: 520, w: 230, enter: 'pop' }),
  T('ЗАПУСК С SSD', 150.0, { y: 880, size: 56 }));
SC(151.10, L,
  M('💿', 151.3, { x: 760, y: 500, size: 260, enter: 'spin' }),
  M('🔑', 152.45, { x: 1160, y: 500, size: 200, enter: 'pop' }),
  T('ПРОСТО ПОДТВЕРЖДАЕТ', 152.5, { y: 860, size: 64 }));
SC(154.30, BL('pickup_town'),
  M('💿', 154.4, { x: 600, y: 500, size: 230, enter: 'pop' }),
  T('=', 155.0, { x: 960, y: 500, size: 170, weight: 900 }),
  M('☁️', 155.35, { x: 1320, y: 500, size: 230, enter: 'pop' }),
  T('СКОРОСТЬ ОДИНАКОВАЯ', 155.4, { y: 860, size: 64 }));
SC(157.56, L,
  M('💿', 157.7, { x: 960, y: 450, size: 320, enter: 'spin' }),
  T('ОГРАНИЧЕННЫЙ ОБЪЁМ', 159.85, { y: 860, size: 72, ul: true }));
SC(160.92, L,
  T('БЕЗ ДИСКА', 160.95, { y: 230, size: 84 }),
  M('♾️', 162.3, { x: 960, y: 600, size: 280, enter: 'pop' }));
SC(163.88, L,
  I('ps5.png', 163.95, { x: 520, y: 540, w: 340, enter: 'pop' }),
  NUM(0, 825, { at: 164.95, x: 1300, y: 400, size: 130, suffix: ' ГБ', dur: 0.8 }),
  NUM(0, 667, { at: 168.1, x: 1300, y: 640, size: 130, suffix: ' ГБ', dur: 0.6, color: RED }),
  T('ПОД ИГРЫ', 168.35, { x: 1300, y: 760, size: 46, weight: 700 }));
SC(170.18, L,
  M('💿', 170.5, { x: 560, y: 470, size: 240, enter: 'pop' }),
  XMARK({ at: 171.15, x: 560, y: 470, size: 280 }),
  EMO('💿💿💿', { at: 172.35, x: 1330, y: 400, size: 140, enter: 'pop', float: 4 }),
  I('rdr2_logo.png', 173.95, { x: 1330, y: 720, w: 440, enter: 'pop' }));

// ===== EUPHORIA (после рекламы) =====
SC(175.00, L,
  I('gta4_logo.png', 175.1, { x: 520, y: 520, w: 400, enter: 'pop' }),
  I('niko_cut.png', 176.0, { x: 1350, y: 560, w: 320, enter: 'rise' }),
  T('EUPHORIA', 177.15, { y: 940, size: 100, color: BLUE, weight: 900 }));
SC(178.28, L,
  C('g6_ragdoll', 178.3, { x: 800, y: 520, w: 1100, out: 182.95 }),
  M('🦴', 179.3, { x: 1640, y: 330, size: 160, enter: 'pop' }),
  M('💪', 179.9, { x: 1640, y: 640, size: 160, enter: 'pop' }));
SC(183.48, L,
  T('ЗАПИСАННАЯ | АНИМАЦИЯ', 183.55, { y: 520, size: 96 }),
  XMARK({ at: 184.9, x: 960, y: 520, size: 380 }));
SC(185.76, L,
  C('g6_hood_fly', 185.8, { x: 960, y: 480, w: 1150, out: 189.45 }),
  T('ПОД КАЖДОЕ ТЕЛО', 188.15, { y: 980, size: 56 }));
SC(189.72, L,
  I('ps3.png', 189.8, { x: 540, y: 540, w: 380, enter: 'pop' }),
  EMO('🧍🧍🧍', { at: 191.5, x: 1320, y: 540, size: 150, enter: 'pop', float: 4 }));
SC(193.06, L,
  I('ps5.png', 193.25, { x: 420, y: 540, w: 300, enter: 'pop' }),
  C('g6_fight', 194.4, { x: 1220, y: 540, w: 1000, enter: 'right' }),
  T('ЦЕЛАЯ ТОЛПА', 194.6, { x: 1220, y: 980, size: 56 }));
SC(195.44, L,
  C('jason_face1', 195.5, { x: 960, y: 560, w: 1150 }),
  T('ВОЛОСЫ', 195.8, { y: 120, size: 84, ul: true }));
SC(198.12, L,
  I('trevor.png', 198.2, { x: 560, y: 560, w: 380, enter: 'left' }),
  T('ПЛОСКИЕ ЛЕНТЫ', 199.3, { x: 1320, y: 540, size: 80 }));
SC(201.38, L,
  C('fat_close', 201.4, { x: 820, y: 520, w: 1100, out: 206.55 }),
  T('ОТДЕЛЬНЫЕ ПРЯДИ', 203.5, { x: 820, y: 120, size: 70 }),
  M('💇', 205.9, { x: 1650, y: 760, size: 170, enter: 'pop' }));
SC(207.44, L,
  C('brian_face', 207.5, { x: 800, y: 520, w: 1100 }),
  M('💡', 208.65, { x: 1640, y: 320, size: 180, enter: 'drop' }),
  T('СВЕТОВЫЕ ЗОНДЫ', 209.15, { x: 800, y: 980, size: 60 }));
SC(210.76, L,
  M('📷', 211.55, { x: 700, y: 500, size: 240, enter: 'pop' }),
  T('360°', 212.15, { x: 1300, y: 500, size: 170, color: RED, weight: 900 }),
  T('КАЖДЫЙ КАДР', 213.4, { y: 880, size: 70, ul: true }));

// ===== ФИЗИКА МАШИН =====
SC(214.88, L,
  I('police_car.png', 215.0, { x: 960, y: 580, w: 900, enter: 'left' }),
  T('ФИЗИКА МАШИН', 215.0, { y: 170, size: 90, ul: true }));
SC(217.28, L,
  I('gta5_logo.png', 217.3, { x: 520, y: 470, w: 360, enter: 'pop' }),
  T('СКОРОСТЬ', 217.4, { x: 520, y: 760, size: 64 }),
  T('+', 218.35, { x: 960, y: 500, size: 160, weight: 900 }),
  I('gta4_logo.png', 218.7, { x: 1400, y: 470, w: 400, enter: 'pop' }),
  T('ВЕС', 218.8, { x: 1400, y: 760, size: 64 }));
SC(220.32, L,
  C('amb_crash', 220.35, { x: 860, y: 520, w: 1150 }),
  M('🛞', 221.0, { x: 1680, y: 300, size: 150, enter: 'spin' }));
SC(224.68, L,
  C('bush_crash', 224.7, { x: 860, y: 500, w: 1100 }),
  M('🎬', 227.2, { x: 1680, y: 280, size: 150, enter: 'pop' }),
  T('ДРАМАТИЧНЕЕ', 226.95, { y: 990, size: 60 }));
SC(228.26, L,
  C('crash_cam1', 228.3, { x: 960, y: 560, w: 1150, out: 230.75 }),
  C('crash_cam3', 230.9, { x: 960, y: 560, w: 1150, enter: 'pop' }),
  T('КАМЕРА АВАРИЙ', 228.8, { y: 110, size: 70, ul: true }));
SC(232.86, L,
  M('⛽', 233.85, { x: 520, y: 480, size: 240, enter: 'pop' }),
  T('ТОПЛИВО', 234.1, { x: 520, y: 760, size: 70 }),
  C('shop_crash', 234.8, { x: 1300, y: 500, w: 900, enter: 'right' }));

// ===== 30 FPS =====
SC(237.18, FULL('storm_marina'),
  T('НАСТОЯЩИЙ ВЫЗОВ', 241.4, { y: 920, size: 90, color: WHITE, glow: true }));
SC(243.00, L,
  C('storm_land', 243.0, { x: 700, y: 520, w: 980, enter: 'left' }),
  T('30 FPS?', 245.7, { x: 1520, y: 520, size: 130, color: RED, weight: 900, enter: 'zoom' }));
SC(246.80, L,
  M('⏱️', 247.1, { x: 560, y: 520, size: 240, enter: 'pop' }),
  T('60 FPS', 247.9, { x: 1300, y: 400, size: 110 }),
  NUM(0, 16, { at: 250.25, x: 1300, y: 620, size: 130, suffix: ' мс', dur: 0.5, color: RED }));
SC(251.92, L,
  M('⏱️', 252.0, { x: 560, y: 470, size: 240, enter: 'pop' }),
  T('30 FPS', 252.2, { x: 1300, y: 400, size: 110 }),
  NUM(0, 33, { at: 253.4, x: 1300, y: 620, size: 130, suffix: ' мс', dur: 0.6, color: GREEN }),
  T('×2 ВРЕМЕНИ', 254.8, { x: 560, y: 780, size: 70 }));
SC(256.96, L,
  C('pink_floor', 257.0, { x: 960, y: 560, w: 1150 }),
  T('МИР > FPS', 258.75, { y: 110, size: 84, weight: 900 }));
SC(261.94, L,
  C('boat_storm', 262.0, { x: 960, y: 480, w: 1100 }),
  T('ПУСТЫЕ МЕСТА', 263.3, { y: 980, size: 64 }));
SC(265.92, L,
  C('night_green', 266.0, { x: 780, y: 500, w: 1050 }),
  T('КАЖДЫЙ УГОЛОК', 267.6, { x: 780, y: 990, size: 60 }),
  I('rockstar.png', 269.0, { x: 1640, y: 330, w: 230, enter: 'pop' }),
  M('🧰', 270.3, { x: 1640, y: 680, size: 150, enter: 'pop' }));
SC(271.86, L,
  C('night_sportcar', 271.9, { x: 960, y: 560, w: 1150 }),
  T('ОТСЕЧЕНИЕ НЕВИДИМОГО', 272.5, { y: 110, size: 64, ul: true }),
  M('👀', 274.45, { x: 1700, y: 880, size: 150, enter: 'pop' }));
SC(277.40, L,
  T('СЕТКА', 277.6, { y: 180, size: 80 }),
  ICONS(['💡', '💡', '💡', '💡', '💡'], { at: 279.1, step: 0.07, x: 960, y: 470, size: 120, bgc: '#1f2a44' }),
  ICONS(['💡', '💡', '💡', '💡', '💡'], { at: 279.5, step: 0.07, x: 960, y: 640, size: 120, bgc: '#1f2a44' }),
  T('В КАЖДОЙ ЯЧЕЙКЕ — ЗОНД', 279.6, { y: 880, size: 52 }));
SC(280.76, L,
  C('buggy_ride', 280.8, { x: 900, y: 500, w: 1100 }),
  M('👣', 283.6, { x: 1680, y: 270, size: 150, enter: 'pop' }),
  T('СЛЕДЫ НА ПЕСКЕ', 282.8, { y: 990, size: 60 }));
SC(284.88, L,
  I('rockstar.png', 285.1, { x: 960, y: 200, w: 200, enter: 'pop' }),
  T('КАРТА БОЛЬШЕ', 287.85, { y: 440, size: 70 }),
  T('ГРАФИКА ЛУЧШЕ', 288.7, { y: 580, size: 70 }),
  T('ВОЖДЕНИЕ ИНТЕРЕСНЕЕ', 289.45, { y: 720, size: 70 }));
SC(290.84, L,
  C('street_boom', 290.9, { x: 960, y: 470, w: 1100 }),
  ICONS(['🚗', '🧍', '🌧️', '🐊', '🔥', '🌊'], { at: 292.3, step: 0.12, x: 960, y: 970, size: 100 }));
SC(296.32, L,
  M('👨‍💻', 296.6, { x: 560, y: 470, size: 230, enter: 'pop' }),
  T('ТЫСЯЧИ РАЗРАБОТЧИКОВ', 297.1, { x: 560, y: 760, size: 48 }),
  NUM(0, 1.5, { at: 300.3, x: 1360, y: 470, size: 130, prefix: '$', suffix: ' МЛРД', dur: 0.6, color: GREEN, fmt: (v) => v.toFixed(1).replace('.', ',') }),
  T('БЮДЖЕТ', 298.3, { x: 1360, y: 640, size: 56 }));

// ===== УРОКИ GTA 4, ТРАФИК =====
SC(301.80, L,
  I('gta4_logo.png', 301.9, { x: 560, y: 470, w: 400, enter: 'pop' }),
  I('ps3_fat.png', 304.7, { x: 1360, y: 480, w: 250, enter: 'pop' }),
  NUM(30, 2, { at: 306.8, x: 960, y: 880, size: 110, suffix: ' FPS', dur: 0.8, color: RED }));
SC(308.42, L,
  T('2 ГОДА', 309.2, { y: 330, size: 140, weight: 900 }),
  ICONS(['✂️', '🗜️', '🛠️'], { at: 310.4, times: [310.42, 311.38, 312.48], x: 960, y: 680, size: 150 }));
SC(313.16, L,
  C('g6_taxi_city', 313.2, { x: 860, y: 520, w: 1100 }),
  M('😱', 314.5, { x: 230, y: 860, size: 150, enter: 'pop' }),
  I('gta6_logo.png', 315.9, { x: 1660, y: 250, w: 280, enter: 'pop' }));
SC(316.90, L,
  C('g6_car_street', 316.95, { x: 760, y: 520, w: 1050, enter: 'left' }),
  T('ТРАФИК', 317.7, { x: 1600, y: 300, size: 76 }),
  ICONS(['🚦', '🌧️', '🚗'], { at: 323.2, times: [323.22, 323.84, 324.48], x: 1600, y: 600, size: 110, gap: 14 }));
SC(325.36, L,
  M('🧠', 326.35, { x: 600, y: 440, size: 200, enter: 'pop' }),
  T('РЯДОМ', 327.7, { x: 600, y: 680, size: 64 }),
  M('🤖', 329.4, { x: 1340, y: 440, size: 200, enter: 'pop' }),
  T('АВТОПИЛОТ', 330.0, { x: 1340, y: 680, size: 64 }));

// ===== РАЗРУШЕНИЯ, ПОТ =====
SC(331.00, L,
  C('buggy_smash', 331.0, { x: 960, y: 480, w: 1100 }),
  T('КАЖДЫЙ ОСКОЛОК', 334.0, { y: 990, size: 64 }));
SC(336.24, L,
  C('vs_glass', 336.25, { x: 960, y: 500, w: 1200 }),
  T('ЗАМЕДЛИТСЯ', 340.65, { y: 990, size: 64, color: RED }),
  M('🐌', 340.75, { x: 1720, y: 230, size: 150, enter: 'pop' }));
SC(341.54, L,
  C('vs_glass2', 341.6, { x: 960, y: 500, w: 1150 }),
  T('ИСЧЕЗАЮТ', 345.1, { y: 990, size: 64 }),
  M('💨', 345.2, { x: 1700, y: 230, size: 150, enter: 'pop' }));
SC(347.54, L,
  C('beach_people', 347.6, { x: 760, y: 520, w: 1000, off: 4.0 }),
  M('💧', 349.45, { x: 1580, y: 380, size: 200, enter: 'drop' }),
  T('СЛИШКОМ ТЯЖЕЛО', 351.3, { x: 1580, y: 680, size: 46 }));
SC(352.26, L,
  M('💧', 353.85, { x: 500, y: 480, size: 190, enter: 'pop' }),
  ARROW({ at: 355.9, x1: 680, y1: 480, x2: 1080, y2: 480, bend: 80 }),
  M('🏷️', 356.55, { x: 1340, y: 480, size: 210, enter: 'pop' }),
  T('ПРОЗРАЧНАЯ НАКЛЕЙКА', 357.6, { y: 860, size: 64 }));
SC(358.60, L,
  C('beach_walk', 358.6, { x: 960, y: 520, w: 1150, off: 3.8 }));
SC(360.46, L,
  C('beach_crowd3', 360.5, { x: 860, y: 500, w: 1100, off: 2.8 }),
  M('✨', 362.4, { x: 1680, y: 280, size: 170, enter: 'pop' }),
  T('ИЛЛЮЗИЯ КАПЕЛЬ', 363.5, { y: 990, size: 60 }));
SC(364.42, L,
  NUM(0, 32, { at: 367.1, x: 960, y: 420, size: 180, suffix: ' КБ', dur: 0.5 }),
  ICONS(['🧍', '🧍', '🧍', '🧍', '🧍'], { at: 369.6, step: 0.1, x: 960, y: 740, size: 110 }));

// ===== ЖИВОЙ МИР, DUALSENSE =====
SC(371.08, L,
  PHOTO('gta-6-vice-city-skyline-website-teaser.jpg', 371.1, { x: 960, y: 500, w: 1150, enter: 'zoom', float: 3 }),
  M('✈️', 373.8, { x: 1700, y: 230, size: 150, enter: 'left' }),
  T('МАЙАМИ', 375.45, { y: 990, size: 76 }));
SC(376.78, L,
  C('night_crowd', 376.8, { x: 800, y: 520, w: 1050 }),
  M('📱', 380.1, { x: 1620, y: 560, size: 240, enter: 'rise' }));
SC(382.20, L,
  M('☀️', 382.4, { x: 600, y: 420, size: 200, enter: 'pop' }),
  T('ЧАС ПИК', 384.45, { x: 600, y: 650, size: 64 }),
  EMO('🚗🚗🚶🚶', { at: 384.9, x: 600, y: 800, size: 90, enter: 'pop' }),
  M('🌙', 386.95, { x: 1320, y: 420, size: 200, enter: 'pop' }),
  T('НОЧЬЮ МЕНЬШЕ', 387.05, { x: 1320, y: 650, size: 64 }));
SC(388.08, L,
  C('daiquiri', 388.1, { x: 960, y: 520, w: 1150, off: 6.3 }),
  RING({ at: 389.3, x: 960, y: 560, size: 560 }),
  T('ОГРОМНАЯ НАГРУЗКА', 391.9, { y: 990, size: 60 }));
SC(393.12, L,
  I('ps5.png', 393.2, { x: 960, y: 480, w: 330, enter: 'pop' }),
  T('ТОЛЬКО PS5', 394.3, { y: 900, size: 80, ul: true }));
SC(395.64, L,
  I('ps3_slim.png', 395.7, { x: 600, y: 540, w: 540, enter: 'left' }),
  T('ВИБРОМОТОР', 397.1, { x: 1360, y: 450, size: 80 }),
  M('〰️', 398.6, { x: 1360, y: 650, size: 150, enter: 'pop' }));
SC(400.02, L,
  I('dualsense.png', 400.05, { x: 960, y: 450, w: 720, enter: 'zoom' }),
  T('СОПРОТИВЛЕНИЕ КУРКОВ', 402.75, { y: 870, size: 60, out: 403.95 }),
  T('ПИСТОЛЕТ — ЛЕГКО', 404.2, { x: 560, y: 880, size: 48 }),
  T('ДРОБОВИК — ТЯЖЕЛО', 405.85, { x: 1360, y: 880, size: 48 }));

// ===== ЛОДКИ, ВОДА, ОСТРОВА =====
SC(406.84, L,
  C('boat_turn', 406.85, { x: 960, y: 560, w: 1150, out: 411.4 }),
  C('boat_green', 411.55, { x: 960, y: 560, w: 1150, enter: 'pop' }),
  T('ВЫСОТА ВОДЫ', 409.15, { y: 110, size: 70, ul: true }),
  M('⬆️', 412.25, { x: 1700, y: 300, size: 140, enter: 'up' }));
SC(413.46, L,
  C('boat_mangr', 413.5, { x: 820, y: 520, w: 1100 }),
  M('⬇️', 414.35, { x: 1690, y: 300, size: 140, enter: 'down' }),
  T('ПЕНА — ЭТО КАРТИНКА', 416.9, { x: 820, y: 990, size: 56 }));
SC(419.80, L,
  C('boat_bridge', 419.85, { x: 960, y: 560, w: 1150 }),
  T('САМОЕ СЛОЖНОЕ', 420.85, { y: 110, size: 70 }));
SC(424.34, L,
  C('jeep_traffic', 424.35, { x: 880, y: 520, w: 1100 }),
  M('🙈', 425.0, { x: 1700, y: 270, size: 150, enter: 'pop' }));
SC(426.58, FULL('beach_surf'),
  T('ДО САМОГО ГОРИЗОНТА', 428.55, { y: 920, size: 84, color: WHITE, glow: true }));
SC(431.64, L,
  C('vs_jetski', 431.7, { x: 900, y: 520, w: 1250 }),
  M('👁️', 435.4, { x: 1720, y: 250, size: 140, enter: 'pop' }));
SC(436.64, L,
  C('boat_under', 436.7, { x: 960, y: 500, w: 1150 }),
  T('ЦЕПОЧКА МОСТОВ', 439.95, { y: 990, size: 64 }));
SC(441.26, L,
  M('🏝️', 441.3, { x: 330, y: 330, size: 180, enter: 'pop' }),
  BAR({ at: 443.8, x: 960, y: 330, w: 820, label: '', from: 0, to: 100, dur: 1.2 }),
  M('🏝️', 444.85, { x: 1620, y: 330, size: 180, enter: 'pop' }),
  XMARK({ at: 445.4, x: 330, y: 330, size: 210 }),
  T('ЗАГРУЗИТЬ И ВЫГРУЗИТЬ', 444.0, { y: 760, size: 64 }));

// ===== ПОТРЕБНОСТИ =====
SC(447.34, L,
  I('jason.png', 447.4, { x: 960, y: 560, w: 440, enter: 'rise' }),
  T('ПОТРЕБНОСТИ', 450.0, { y: 980, size: 80, ul: true }));
SC(451.48, L,
  I('franklin.png', 451.5, { x: 560, y: 620, w: 300, enter: 'rise' }),
  I('michael.png', 451.7, { x: 960, y: 620, w: 300, enter: 'rise' }),
  I('trevor.png', 451.9, { x: 1360, y: 620, w: 300, enter: 'rise' }),
  M('🍔', 452.85, { x: 760, y: 200, size: 110, enter: 'pop' }),
  XMARK({ at: 453.05, x: 760, y: 200, size: 140 }),
  M('😴', 453.35, { x: 1160, y: 200, size: 110, enter: 'pop' }),
  XMARK({ at: 453.55, x: 1160, y: 200, size: 140 }));
SC(454.00, L,
  I('gta6_logo.png', 454.02, { x: 960, y: 260, w: 340, enter: 'pop' }),
  ICONS(['🍔', '😴', '🏋️'], { at: 454.2, times: [454.25, 454.74, 455.06], x: 960, y: 620, size: 160, bgc: '#1f2a44' }),
  T('МЕНЯЮТ ПЕРСОНАЖА', 456.6, { y: 900, size: 60 }));

// ===== УТЕЧКИ =====
SC(459.06, L,
  I('rockstar.png', 459.1, { x: 960, y: 470, w: 330, enter: 'pop' }),
  M('🤫', 460.25, { x: 1380, y: 330, size: 160, enter: 'pop' }),
  M('🔓', 463.65, { x: 540, y: 330, size: 160, enter: 'pop' }),
  T('СЕКРЕТЫ', 464.1, { y: 880, size: 80 }));
SC(465.14, DK('night_police'),
  T('СЕНТЯБРЬ 2022', 465.2, { y: 200, size: 76, color: WHITE, glow: true }),
  M('👨‍💻', 467.15, { x: 560, y: 560, size: 230, enter: 'pop' }),
  NUM(0, 90, { at: 469.0, x: 1320, y: 560, size: 120, suffix: ' ВИДЕО', dur: 0.4, color: WHITE }),
  T('КРУПНЕЙШАЯ УТЕЧКА', 471.45, { y: 900, size: 66, color: '#ff5a5a' }));
SC(473.48, L,
  M('📰', 473.6, { x: 560, y: 470, size: 220, enter: 'pop' }),
  T('ВИДЕО НАСТОЯЩИЕ', 475.1, { x: 560, y: 760, size: 52 }),
  NUM(0, 5, { at: 479.95, x: 1360, y: 470, size: 140, prefix: '$', suffix: ' МЛН', dur: 0.4, color: RED }),
  T('УЩЕРБ', 478.5, { x: 1360, y: 640, size: 56 }));
SC(481.12, L,
  PHOTO('gta6-clip-jason-lucia.jpg', 481.2, { x: 960, y: 520, w: 1000, enter: 'zoom', float: 3 }),
  T('ДЕКАБРЬ 2023', 481.2, { y: 110, size: 70 }),
  T('СЛИЛИ ЗА ДЕНЬ ДО ПРЕМЬЕРЫ', 483.0, { y: 990, size: 52 }));
SC(487.00, L,
  I('rockstar.png', 487.1, { x: 600, y: 420, w: 260, enter: 'pop' }),
  M('📦', 489.25, { x: 600, y: 760, size: 160, enter: 'pop' }),
  T('УВОЛЬНЕНИЯ', 489.3, { x: 1340, y: 400, size: 76 }),
  M('💬', 493.4, { x: 1340, y: 660, size: 180, enter: 'pop' }));
SC(494.10, DK('boat_narrow2'),
  ICONS(['❓', '🗣️', '🗺️'], { at: 496.8, times: [496.82, 497.46, 498.04], x: 960, y: 500, size: 170, bgc: '#333' }),
  T('ТЕОРИИ · СЛУХИ · ФЕЙКИ', 496.9, { y: 800, size: 56, color: WHITE, stag: 0.5 }));
SC(499.16, L,
  PHOTO('gta6-postcard-vicecity.jpg', 499.2, { x: 860, y: 520, w: 820, rot: 3, enter: 'zoom', float: 4 }),
  T('№1', 501.75, { x: 1560, y: 330, size: 150, color: RED, weight: 900, enter: 'zoom' }));
SC(503.68, L,
  M('🎰', 504.25, { x: 700, y: 470, size: 220, enter: 'pop' }),
  M('🏜️', 505.4, { x: 1240, y: 470, size: 220, enter: 'pop' }),
  T('ЛАС-ВЕНТУРАС?', 504.3, { y: 860, size: 70 }));
SC(506.18, L,
  T('МАРТ 2018', 506.2, { y: 200, size: 70 }),
  M('📺', 507.4, { x: 560, y: 560, size: 230, enter: 'pop' }),
  T('PROJECT | AMERICAS', 511.15, { x: 1300, y: 560, size: 80, ul: true }));
SC(512.50, L,
  PHOTO('gta-6-vice-city-skyline-website-teaser-2.jpg', 512.55, { x: 640, y: 520, w: 820, rot: -3, enter: 'left', float: 4 }),
  I('lucia.png', 513.85, { x: 1450, y: 600, w: 420, enter: 'rise' }));
SC(515.10, L,
  CHECK({ at: 516.5, x: 960, y: 420, size: 260 }),
  T('НИКТО НЕ ПОВЕРИЛ', 517.9, { y: 800, size: 76 }));
SC(519.22, DK('seaplane_gold', 3.2),
  T('СЛУХИ ХОДИЛИ ГОДАМИ', 519.3, { y: 540, size: 80, color: WHITE, glow: true }));
SC(522.36, L,
  C('boat_open', 522.4, { x: 700, y: 520, w: 980, enter: 'left' }),
  M('🗺️', 525.3, { x: 1560, y: 400, size: 200, enter: 'pop' }),
  M('✏️', 525.9, { x: 1680, y: 620, size: 130, enter: 'pop' }),
  T('ROCKSTAR INDIA', 528.0, { x: 1500, y: 860, size: 52 }));
SC(529.06, L,
  M('🔥', 532.35, { x: 960, y: 460, size: 250, enter: 'pop' }),
  T('АЖИОТАЖ', 533.0, { y: 820, size: 96 }));

// ===== ПОЧЕМУ ТАК ДОЛГО =====
SC(534.84, L,
  T('2013', 535.95, { y: 140, size: 90 }),
  I('gta5_box.png', 536.55, { x: 620, y: 580, w: 330, enter: 'pop' }),
  I('ps3.png', 537.9, { x: 1320, y: 580, w: 420, enter: 'pop' }));
SC(540.72, L,
  T('ПОЧЕМУ ТАК ДОЛГО?', 540.75, { y: 540, size: 100 }),
  M('⏳', 541.3, { x: 1700, y: 280, size: 150, enter: 'pop' }));
SC(542.42, L,
  I('gta5_logo.png', 543.6, { x: 560, y: 500, w: 380, enter: 'pop' }),
  NUM(0, 200, { at: 546.2, x: 1320, y: 420, size: 120, suffix: ' МЛН', dur: 0.5 }),
  T('КОПИЙ', 546.9, { x: 1320, y: 550, size: 50 }),
  M('💰', 548.6, { x: 1320, y: 780, size: 170, enter: 'pop' }));
SC(550.20, L,
  I('rdr2_logo.png', 551.45, { x: 620, y: 500, w: 560, enter: 'pop' }),
  I('horse.png', 552.85, { x: 1360, y: 540, w: 560, enter: 'right' }),
  T('2018', 557.2, { y: 920, size: 90 }));
SC(558.08, L,
  T('2020', 559.95, { y: 320, size: 120, weight: 900 }),
  BAR({ at: 560.9, x: 960, y: 640, w: 1000, label: 'GTA 5 → 6', from: 0, to: 100, dur: 2.4 }));
SC(564.36, L,
  BAR({ at: 564.4, x: 960, y: 430, w: 1000, label: '4 → 5', from: 0, to: 42, dur: 0.8, col: '#555' }),
  BAR({ at: 564.6, x: 960, y: 640, w: 1000, label: '5 → 6', from: 0, to: 100, dur: 1.2 }),
  T('×2', 565.1, { x: 1660, y: 250, size: 120, color: RED, weight: 900 }));
SC(567.14, L,
  T('МАСШТАБ', 568.65, { y: 150, size: 90, ul: true }),
  M('🌎', 571.55, { x: 960, y: 580, size: 320, enter: 'spin' }));
SC(574.34, L,
  I('ps5.png', 574.4, { x: 700, y: 520, w: 320, enter: 'pop' }),
  M('✂️', 576.25, { x: 1300, y: 520, size: 210, enter: 'pop' }),
  T('ЧАСТЬ ИДЕЙ ВЫРЕЗАЛИ', 576.3, { y: 900, size: 60 }));
SC(577.32, L,
  I('arthur_bust.png', 577.4, { x: 560, y: 560, w: 440, enter: 'left' }),
  M('❄️', 580.3, { x: 860, y: 250, size: 140, enter: 'drop' }),
  I('horse.png', 581.9, { x: 1350, y: 560, w: 620, enter: 'right' }));
SC(583.28, L,
  T('КАРТА ×2', 583.3, { x: 600, y: 450, size: 90 }),
  T('ВНИМАНИЕ ÷2', 584.65, { x: 1320, y: 450, size: 90, color: RED }),
  CHECK({ at: 587.95, x: 960, y: 760, size: 200 }));
SC(589.16, L,
  I('rockstar.png', 589.2, { x: 960, y: 250, w: 230, enter: 'pop' }),
  NUM(0, 2400, { at: 591.45, x: 560, y: 600, size: 120, dur: 0.6 }),
  T('2018', 592.9, { x: 560, y: 730, size: 50 }),
  ARROW({ at: 594.0, x1: 800, y1: 600, x2: 1100, y2: 600, bend: 70 }),
  NUM(0, 4700, { at: 594.7, x: 1360, y: 600, size: 120, dur: 0.6, color: GREEN }),
  T('2026', 596.4, { x: 1360, y: 730, size: 50 }));
SC(597.58, L,
  T('УШЁЛ В 2020', 597.65, { x: 700, y: 420, size: 60, color: RED }),
  T('ДЭН ХАУЗЕР', 599.65, { x: 700, y: 560, size: 96 }),
  M('✍️', 601.3, { x: 1420, y: 500, size: 210, enter: 'pop' }));
SC(603.68, L,
  C('night_drive1', 603.7, { x: 960, y: 500, w: 1150 }),
  T('ОГРОМНАЯ ПЕРЕМЕНА', 606.9, { y: 990, size: 60 }));
SC(608.06, L,
  M('😫', 610.05, { x: 560, y: 500, size: 230, enter: 'pop' }),
  NUM(0, 60, { at: 612.05, x: 1340, y: 450, size: 120, suffix: ' ЧАСОВ', dur: 0.4, color: RED }),
  T('В НЕДЕЛЮ', 612.65, { x: 1340, y: 590, size: 52 }));
SC(613.44, L,
  T('ОСЕНЬ 2025', 614.85, { y: 330, size: 70 }),
  XMARK({ at: 616.25, x: 960, y: 330, size: 150 }),
  T('МАЙ 2026', 616.85, { y: 500, size: 70 }),
  XMARK({ at: 617.85, x: 960, y: 500, size: 150 }),
  T('19 НОЯБРЯ', 618.3, { y: 690, size: 96, color: GREEN }));
SC(619.16, L,
  C('g6_taxi_dmg', 619.2, { x: 900, y: 520, w: 1100 }),
  M('😱', 620.3, { x: 1700, y: 260, size: 150, enter: 'pop' }));
SC(622.54, L,
  M('📅', 622.8, { x: 420, y: 520, size: 210, enter: 'pop' }),
  ICONS(['🎮', '🎮', '🎮'], { at: 623.6, step: 0.15, x: 1180, y: 520, size: 150 }),
  T('НИКТО НЕ ХОЧЕТ ВЫХОДИТЬ С GTA', 625.1, { y: 880, size: 56 }));

// ===== ЧТО ДАЛЬШЕ =====
SC(627.40, L,
  C('amb_beach', 627.45, { x: 880, y: 500, w: 1100 }),
  M('⏳', 631.45, { x: 1700, y: 260, size: 150, enter: 'pop' }));
SC(632.76, L,
  I('gta6_logo.png', 633.45, { x: 620, y: 520, w: 400, enter: 'pop' }),
  T('10+ ЛЕТ', 635.35, { x: 1350, y: 520, size: 130, weight: 900 }));
SC(637.24, L,
  I('rdr2_logo.png', 637.6, { x: 600, y: 470, w: 480, enter: 'pop' }),
  T('3?', 638.0, { x: 600, y: 720, size: 90, color: RED }),
  T('BULLY 2?', 638.85, { x: 1350, y: 520, size: 100 }));
SC(639.62, L,
  T('GTA 7', 639.7, { y: 470, size: 190, weight: 900 }),
  XMARK({ at: 640.8, x: 960, y: 470, size: 380 }),
  T('ЛЕТ 10', 642.2, { y: 860, size: 64 }));
SC(643.00, FULL('amb_gull'),
  I('gta6_logo.png', 643.05, { x: 960, y: 430, w: 440, enter: 'zoom' }),
  T('САМАЯ ОЖИДАЕМАЯ ИГРА', 644.3, { y: 900, size: 76, color: WHITE, glow: true }));
SC(645.70, L,
  M('💬', 646.45, { x: 960, y: 450, size: 250, enter: 'pop' }),
  T('ОПРАВДАЛА ОЖИДАНИЯ?', 648.75, { y: 820, size: 76 }));
SC(650.54, L,
  T('ДРУГИЕ РОЛИКИ', 650.9, { y: 170, size: 76, ul: true }),
  I('ps4.png', 653.05, { x: 620, y: 600, w: 470, enter: 'pop' }),
  I('ps3.png', 653.95, { x: 1340, y: 600, w: 420, enter: 'pop' }));
SC(656.20, BL('beach_bike1'),
  I('jason.png', 656.25, { x: 720, y: 600, w: 420, enter: 'left' }),
  I('lucia.png', 656.35, { x: 1220, y: 620, w: 400, enter: 'right' }),
  T('СПАСИБО ЗА ПРОСМОТР!', 657.2, { y: 120, size: 64 }));
