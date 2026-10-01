// shared pose presets (degrees) + helpers to blend them
export function mix(a, b, k) {
  const out = {};
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) {
    const va = a[key], vb = b[key];
    if (Array.isArray(va) || Array.isArray(vb)) {
      const x = va || [0, 0, 0], y = vb || [0, 0, 0];
      out[key] = x.map((v, i) => v + (y[i] - v) * k);
    } else {
      const x = va ?? (key.endsWith('Curl') ? 0.25 : key.endsWith('Thumb') ? 0.3 : 0), y = vb ?? (key.endsWith('Curl') ? 0.25 : key.endsWith('Thumb') ? 0.3 : 0);
      out[key] = x + (y - x) * k;
    }
  }
  return out;
}
export const STAND = { lSh: [0, 0, 8], rSh: [0, 0, -8], lEl: [-10, 0, 0], rEl: [-10, 0, 0] };
export const SIT = { hipsY: -0.36, lHip: [-88, 0, 4], rHip: [-88, 0, -4], lKnee: [88, 0, 0], rKnee: [88, 0, 0], spine: [6, 0, 0], lSh: [-10, 0, 10], rSh: [-10, 0, -10], lEl: [-40, 0, 0], rEl: [-40, 0, 0] };
// holding a handheld in front of the chest with both hands
export const HOLD = { lSh: [-38, 0, 14], rSh: [-38, 0, -14], lEl: [-78, -20, 0], rEl: [-78, 20, 0], lWr: [0, 0, 0], rWr: [0, 0, 0], lCurl: 0.55, rCurl: 0.55, lThumb: 0.7, rThumb: 0.7, head: [18, 0, 0], neck: [8, 0, 0] };
export const TALK_A = { lSh: [-35, 0, 25], rSh: [-20, 0, -15], lEl: [-70, 30, 0], rEl: [-50, -10, 0], lCurl: 0.1, rCurl: 0.3, lSpread: 1 };
export const TALK_B = { lSh: [-15, 0, 12], rSh: [-45, 0, -30], lEl: [-45, 10, 0], rEl: [-80, -30, 0], lCurl: 0.3, rCurl: 0.05, rSpread: 1 };
export const CROSS = { lSh: [-25, 0, 18], rSh: [-25, 0, -18], lEl: [-105, -50, 0], rEl: [-105, 50, 0], lCurl: 0.5, rCurl: 0.5 };
export const POINT_R = { rSh: [-80, 0, -10], rEl: [-5, 0, 0], rCurl: 0.8, rThumb: 0.8 };
// seated at a desk, typing / gaming
export const TYPE = { ...SIT, lSh: [-24, 0, 8], rSh: [-24, 0, -8], lEl: [-82, 0, 0], rEl: [-82, 0, 0], lCurl: 0.45, rCurl: 0.45, spine: [8, 0, 0], head: [6, 0, 0] };
export const SHRUG = { lSh: [-20, 0, 35], rSh: [-20, 0, -35], lEl: [-70, 40, 0], rEl: [-70, -40, 0], lCurl: 0.1, rCurl: 0.1, lSpread: 1, rSpread: 1 };
export const FACEPALM = { rSh: [-100, 0, -10], rEl: [-130, 0, 0], rCurl: 0.2, head: [20, 0, 0] };
