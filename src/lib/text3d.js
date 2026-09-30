import * as THREE from 'three';
import { TTFLoader } from 'three/addons/loaders/TTFLoader.js';
import { Font } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

const fonts = {};
const FILES = {
  'mont-cyr': '/node_modules/@fontsource/montserrat/files/montserrat-cyrillic-900-normal.woff',
  'mont-lat': '/node_modules/@fontsource/montserrat/files/montserrat-latin-900-normal.woff',
  'russo-cyr': '/node_modules/@fontsource/russo-one/files/russo-one-cyrillic-400-normal.woff',
  'russo-lat': '/node_modules/@fontsource/russo-one/files/russo-one-latin-400-normal.woff',
};

export async function loadFonts() {
  const loader = new TTFLoader();
  await Promise.all(Object.entries(FILES).map(([k, url]) => new Promise((res, rej) => loader.load(url, (json) => { fonts[k] = new Font(json); res(); }, undefined, rej))));
  // cyrillic subsets lack punctuation/digits: borrow those glyphs from the latin subset
  for (const f of ['mont', 'russo']) {
    const cyr = fonts[`${f}-cyr`].data.glyphs, lat = fonts[`${f}-lat`].data.glyphs;
    for (const [ch, gl] of Object.entries(lat)) if (!cyr[ch]) cyr[ch] = gl;
  }
}

// Extruded bevelled 3D text, centred. family: 'mont' | 'russo'. Cyrillic chooses the cyrillic subset.
export function text3d(str, { family = 'mont', size = 1, depth = 0.25, bevel = 0.03, color = '#fff', side = null, emissive = null, emissiveIntensity = 1, metal = 0.1, rough = 0.35, curveSegments = 6 } = {}) {
  const cyr = /[А-Яа-яЁё]/.test(str);
  const font = fonts[`${family}-${cyr ? 'cyr' : 'lat'}`];
  const geo = new TextGeometry(str, { font, size, depth, curveSegments, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel * 0.7, bevelSegments: 3 });
  geo.computeBoundingBox();
  const bb = geo.boundingBox;
  geo.translate(-(bb.max.x + bb.min.x) / 2, -(bb.max.y + bb.min.y) / 2, -(bb.max.z + bb.min.z) / 2);
  const front = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, emissive: emissive || '#000', emissiveIntensity });
  const sideM = new THREE.MeshStandardMaterial({ color: side || new THREE.Color(color).multiplyScalar(0.55), roughness: rough + 0.1, metalness: metal });
  const mesh = new THREE.Mesh(geo, [front, sideM]);
  mesh.castShadow = true; mesh.receiveShadow = true;
  const g = new THREE.Group(); g.add(mesh);
  g.userData.width = bb.max.x - bb.min.x; g.userData.height = bb.max.y - bb.min.y;
  return g;
}
