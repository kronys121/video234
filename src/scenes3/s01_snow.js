import * as THREE from 'three';
import { mk3, club, axe } from '../lib/cast3.js';
import { idle2 } from '../lib/human2.js';
import { snowField, pine, rock, mountain, campfire, woodSign, runestone } from '../lib/fantasy.js';
import { skyDome, sun, particles, smoke, clouds } from '../lib/env.js';
import { solid } from '../lib/overlap.js';
import { V, M, setCam, kf, inv, smooth, easeInOut, easeOutBack, easeInCubic, easeOutCubic, shake, lerp, clamp, rng, glowTex } from '../lib/util.js';

// shared snowy valley: hero at the front, giant camp further back
function snowSet(scene, { dusk = false } = {}) {
  scene.fog = new THREE.Fog(dusk ? '#9aa8c0' : '#9fb6d2', 70, 320);
  scene.add(skyDome(dusk ? [[0, '#3a4a78'], [0.4, '#8a9ac0'], [0.5, '#e8c8b0'], [1, '#9aa8c0']] : [[0, '#4a78b8'], [0.4, '#9cc0e4'], [0.5, '#e4eef8'], [1, '#c4d2e2']]));
  scene.add(clouds(9, 3, 200, 40));
  scene.add(new THREE.HemisphereLight('#cfdcf4', '#6a7688', 0.75));
  sun(scene, { color: '#fff1dc', intensity: 2.6, pos: [-18, 30, 16], size: 14 });
  const ground = snowField(240, 9, 2); scene.add(ground);
  const r = rng(7);
  for (let i = 0; i < 26; i++) { const a = r() * Math.PI * 2, d = 12 + r() * 40; const p = pine(5 + r() * 5, i); p.position.set(Math.cos(a) * d, ground.userData.heightAt(Math.cos(a) * d, Math.sin(a) * d) - 0.2, Math.sin(a) * d - 6); scene.add(p); }
  for (let i = 0; i < 8; i++) { const m = mountain(25 + r() * 20, 40 + r() * 30, i); m.position.set(-120 + i * 34, 0, -120 - r() * 30); scene.add(m); }
  for (let i = 0; i < 10; i++) { const k = rock(0.4 + r() * 0.8, i + 20); const a = r() * Math.PI * 2, d = 6 + r() * 6; k.position.set(Math.cos(a) * d, 0.1, Math.sin(a) * d - 4); scene.add(k); }
  const snow = particles({ n: 140, seed: 5, tex: glowTex('rgba(255,255,255,1)'), color: '#ffffff', additive: false, size: [0.04, 0.09], life: [3, 5], origin: [0, 6, 0], spread: [22, 2, 22], vel: [0.3, -1.5, 0], velSpread: [0.2, 0.2, 0.2], opacity: 0.9, fade: false, turb: 0.4 });
  scene.add(snow);
  const fireC = campfire(); fireC.position.set(2.6, 0, -6.2); scene.add(solid(fireC, 'fire'));
  const tentPoles = new THREE.Group(); for (const a of [0, 2.1, 4.2]) { const pl = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 4.6, 8), M.col('#5a3a20', 0.9)); pl.position.set(Math.cos(a) * 0.9, 2.1, Math.sin(a) * 0.9); pl.rotation.set(Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35); tentPoles.add(pl); }
  const hide = new THREE.Mesh(new THREE.ConeGeometry(2.0, 3.6, 10, 1, true), M.std({ color: '#8a6a4a', roughness: 1, side: THREE.DoubleSide })); hide.position.y = 1.8; tentPoles.add(hide);
  tentPoles.position.set(-4.2, 0, -9); tentPoles.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); scene.add(solid(tentPoles, 'tent'));
  return { ground, snow, fireC };
}

// 0.00–2.86  «Если вы играли в Skyrim, то наверняка помните:»
export function buildIntro() {
  const scene = new THREE.Scene(); const S = snowSet(scene);
  const hero = mk3.hero(); hero.root.position.set(0, 0, 2.2); hero.root.rotation.y = Math.PI; scene.add(hero.root); axe(hero);
  const stone = runestone('SKYRIM', 2.3); stone.position.set(1.7, 0, 1.0); stone.rotation.y = -0.4; scene.add(solid(stone, 'stone'));
  const camera = new THREE.PerspectiveCamera(56, 1080 / 1920, 0.05, 600);
  function update(lt) {
    hero.pose({ rSh: [-25, 0, -12], rEl: [-40, 0, 0], rCurl: 0.8, lSh: [-5, 0, 12], head: [0, 12 * Math.sin(lt * 0.8), 0] }); idle2(hero, lt, 1, 0.6);
    hero.face({ blink: 0, brows: 0.2 });
    S.snow.userData.update(lt + 2); S.fireC.userData.fire.userData.update(lt);
    const f = kf(lt, [[0, [6, 16, 26], [0, 2, -6], 60, 0.1], [1.6, [2.6, 4.2, 8], [0.4, 1.8, -2], 56, 0.04], [2.86, [1.0, 2.0, 4.6], [0.2, 1.6, -3], 54, 0]]);
    setCam(camera, f.pos.add(shake(lt, 0.01, 4, 1)), f.look, f.roll, f.fov);
  }
  return { scene, camera, update, exposure: 0.85, bloom: 0.2, bloomThreshold: 0.96, envIntensity: 0.35 };
}

// giant + hero staging used by the next three shots
function duel(scene) {
  const S = snowSet(scene);
  const giant = mk3.giant(); giant.root.position.set(0, 0, -4.4); scene.add(giant.root); const cl = club(giant);
  const hero = mk3.hero(); hero.root.position.set(0.3, 0, -1.5); hero.root.rotation.y = Math.PI; scene.add(hero.root); axe(hero);
  const warn = woodSign('НЕ ШУТИТЬ!', 1.5, { size: 120 }); warn.position.set(-2.0, 0, -2.4); warn.rotation.y = 0.45; scene.add(solid(warn, 'sign'));
  return { S, giant, hero, cl, warn };
}
const giantIdle = (g, lt) => { g.pose({ rSh: [-20, 0, -18], rEl: [-35, 0, 0], rCurl: 0.9, lSh: [0, 0, 14], lEl: [-15, 0, 0], head: [12, 0, 0], spine: [6, 0, 0] }); idle2(g, lt, 3, 0.5); };

// 2.86–5.40  «великан в самом начале игры весьма доходчиво»
export function buildGiant() {
  const scene = new THREE.Scene(); const D = duel(scene);
  const camera = new THREE.PerspectiveCamera(58, 1080 / 1920, 0.05, 600);
  function update(lt) {
    giantIdle(D.giant, lt); D.giant.face({ blink: 0, brows: -0.5, browTilt: 0.8, mouth: 0.05 });
    D.hero.pose({ rSh: [-25, 0, -12], rEl: [-40, 0, 0], rCurl: 0.8, lSh: [-5, 0, 12], head: [-10 - 10 * smooth(inv(0.5, 1.5, lt)), 0, 0] }); idle2(D.hero, lt, 2, 0.4);
    D.S.snow.userData.update(lt + 5); D.S.fireC.userData.fire.userData.update(lt);
    // low behind the hero, tilting up to reveal the giant
    const f = kf(lt, [[0, [1.0, 0.5, 2.2], [0.3, 1.3, -3], 62, 0.04], [2.54, [0.8, 0.35, 1.6], [0, 4.2, -4.4], 62, -0.03]]);
    setCam(camera, f.pos.add(shake(lt, 0.006, 4, 2)), f.look, f.roll, f.fov);
  }
  return { scene, camera, update, exposure: 0.85, bloom: 0.2, bloomThreshold: 0.96, envIntensity: 0.35 };
}

// 5.40–7.75  «объясняет, что с ним лучше не шутить.»
export function buildWarn() {
  const scene = new THREE.Scene(); const D = duel(scene);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 600);
  function update(lt) {
    const up = smooth(inv(0.2, 0.8, lt)), wag = Math.sin(lt * 10) * smooth(inv(0.5, 0.8, lt));
    D.giant.pose({ rSh: [lerp(-20, -165, up), 0, -18], rEl: [lerp(-35, -20, up), 0, 0], rCurl: 0.9, lSh: [lerp(0, -80, up), 0, 20], lEl: [lerp(-15, -70, up), wag * 20, 0], lCurl: 0.8, lThumb: 0.8, head: [20 * up, wag * 6, 0], spine: [6 + 6 * up, 0, 0] });
    idle2(D.giant, lt, 3, 0.3);
    D.giant.face({ blink: 0, brows: -1, browTilt: 1, mouth: 0.25 + 0.5 * smooth(inv(0.9, 1.3, lt)) * Math.abs(Math.sin(lt * 7)), smile: -0.6 });
    D.hero.pose({ rSh: [-25, 0, -12], rEl: [-40, 0, 0], rCurl: 0.8, lSh: [-5, 0, 12], head: [-22, 0, 0] }); idle2(D.hero, lt, 2, 0.3);
    const k = easeOutBack(inv(0.9, 1.3, lt), 2.2); D.warn.scale.set(1, Math.max(0.001, k), 1);
    D.S.snow.userData.update(lt + 8); D.S.fireC.userData.fire.userData.update(lt);
    // looking up at the giant's face from over the hero's shoulder, pushing in, slight shake on the roar
    const f = kf(lt, [[0, [-0.7, 1.7, -0.2], [0, 3.6, -4.4], 54, 0.05], [2.35, [-0.35, 2.0, -1.0], [0, 4.0, -4.4], 48, -0.05]]);
    setCam(camera, f.pos.add(shake(lt, 0.006 + 0.03 * smooth(inv(0.9, 1.2, lt)), 12, 3)), f.look, f.roll, f.fov);
  }
  return { scene, camera, update, exposure: 0.85, bloom: 0.2, bloomThreshold: 0.96, envIntensity: 0.35 };
}

// 7.75–10.10  «Один его удар и персонаж улетает»
export function buildHit() {
  const scene = new THREE.Scene(); const D = duel(scene);
  const burst = particles({ n: 70, seed: 9, tex: glowTex('rgba(255,255,255,1)'), color: '#ffffff', additive: false, size: [0.15, 0.4], life: [0.6, 1.2], origin: [0.3, 0.6, -1.5], spread: [0.6, 0.3, 0.6], vel: [0, 3.5, 0], velSpread: [3, 2, 3], grav: 4, opacity: 0.9, fade: true });
  scene.add(burst);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.8, 1, 48), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); ring.rotation.x = -Math.PI / 2; ring.position.set(0.3, 0.1, -1.5); scene.add(ring);
  const trail = particles({ n: 40, seed: 4, tex: glowTex('rgba(255,255,255,1)'), color: '#cfe6ff', size: [0.15, 0.3], life: [0.4, 0.8], origin: [0, 0, 0], spread: [0.3, 0.3, 0.3], vel: [0, 0, 0], velSpread: [0.2, 0.2, 0.2], opacity: 0.8 }); scene.add(trail);
  const camera = new THREE.PerspectiveCamera(56, 1080 / 1920, 0.05, 900);
  const HIT = 0.73;
  function update(lt) {
    const lift = smooth(inv(0.0, 0.4, lt)), sw = easeInCubic(inv(0.42, HIT, lt));
    D.giant.pose({ rSh: [lerp(-20, -170, lift) + sw * 150, 0, -18 + sw * 10], rEl: [-20, 0, 0], rCurl: 0.9, lSh: [-10, 0, 14], head: [16, 0, 0], spine: [6 + 18 * sw, 0, 0] });
    idle2(D.giant, lt, 3, 0.2); D.giant.face({ blink: 0, brows: -1, browTilt: 1, mouth: 0.7 * sw, smile: -0.5 });
    // hero: stands, then gets launched up and away, tumbling
    const a = lt - HIT;
    if (a < 0) { D.hero.pose({ rSh: [-60, 0, -12], rEl: [-60, 0, 0], rCurl: 0.8, lSh: [-30, 0, 12], head: [-20, 0, 0] }); D.hero.root.position.set(0.3, 0, -1.5); D.hero.root.rotation.set(0, Math.PI, 0); }
    else { D.hero.pose({ lSh: [-160, 0, 40], rSh: [-160, 0, -40], lHip: [-40, 0, 20], rHip: [30, 0, -20], lKnee: [60, 0, 0], rKnee: [20, 0, 0], head: [-20, 0, 0] }); D.hero.root.position.set(0.3 + a * 2.5, a * 22 - 2 * a * a, -1.5 + a * 9); D.hero.root.rotation.set(a * 9, Math.PI + a * 4, a * 6); }
    D.hero.face({ blink: 0, brows: a > 0 ? 1 : 0.4, mouth: a > 0 ? 0.9 : 0.1 });
    burst.visible = a > 0; burst.userData.update(Math.max(0, a));
    ring.visible = a > 0 && a < 0.6; ring.scale.setScalar(1 + a * 12); ring.material.opacity = clamp(1 - a / 0.6);
    trail.visible = a > 0; trail.position.copy(D.hero.root.position).add(V(0, 0.9, 0)); trail.userData.update(lt);
    D.S.snow.userData.update(lt + 11); D.S.fireC.userData.fire.userData.update(lt);
    // side view of the swing, then tilt up after the flying hero
    const hp = D.hero.root.position;
    const pos = V(4.4, 1.7, 4.4).lerp(V(5.4, 2.6, 6.5), smooth(inv(HIT, HIT + 1.4, lt)));
    const look = V(0.1, 2.0, -2.0).lerp(V(hp.x, hp.y + 1, hp.z), smooth(inv(HIT + 0.1, HIT + 0.6, lt)));
    const hit = a > 0 ? Math.exp(-a * 5) : 0;
    setCam(camera, pos.add(shake(lt, 0.01 + hit * 0.12, 18, 5)), look, 0.05 - 0.1 * smooth(inv(HIT, HIT + 1.2, lt)), 56);
  }
  return { scene, camera, update, exposure: 0.85, bloom: 0.25, bloomThreshold: 0.94, envIntensity: 0.35 };
}
