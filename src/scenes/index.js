import { build as s01 } from './s01_desert.js';
import { build as s02 } from './s02_barracks.js';
import { build as s03 } from './s03_airstrike.js';
import { build as s04 } from './s04_ruins.js';
import { build as s05 } from './s05_melted.js';
import { build as s06 } from './s06_cartridge.js';
import { build as s07 } from './s07_parcel.js';
import { build as s08 } from './s08_flight.js';
import { build as s09 } from './s09_lab.js';
import { build as s10 } from './s10_screen.js';
import { build as s11 } from './s11_battery.js';
import { build as s12 } from './s12_hq.js';
import { build as s13 } from './s13_display.js';
import { build as s14 } from './s14_guide.js';
import { build as s15 } from './s15_final.js';

// Shot list, cut points follow pauses / sense breaks in the narration.
// trans = transition INTO this shot: cut | flash | whip (motion-blurred pan) | split (diagonal split-screen)
export const SHOTS = [
  { id: 'desert', start: 0.0, end: 4.07, trans: 'cut', build: s01 },
  { id: 'barracks', start: 4.07, end: 7.45, trans: 'flash', build: s02 },
  { id: 'airstrike', start: 7.45, end: 10.45, trans: 'whip', build: s03 },
  { id: 'ruins', start: 10.45, end: 14.15, trans: 'flash', build: s04 },
  { id: 'melted', start: 14.15, end: 17.72, trans: 'whip', build: s05 },
  { id: 'cartridge', start: 17.72, end: 20.3, trans: 'cut', build: s06 },
  { id: 'parcel', start: 20.3, end: 23.05, trans: 'whip', whipDir: -1, build: s07 },
  { id: 'flight', start: 23.05, end: 25.7, trans: 'whip', build: s08 },
  { id: 'lab', start: 25.7, end: 28.45, trans: 'flash', build: s09 },
  { id: 'screen', start: 28.45, end: 31.85, trans: 'split', build: s10 },
  { id: 'battery', start: 31.85, end: 35.12, trans: 'whip', whipDir: -1, build: s11 },
  { id: 'hq', start: 35.12, end: 38.75, trans: 'flash', build: s12 },
  { id: 'display', start: 38.75, end: 43.05, trans: 'whip', build: s13 },
  { id: 'guide', start: 43.05, end: 46.3, trans: 'split', build: s14 },
  { id: 'final', start: 46.3, end: 49.5, trans: 'flash', build: s15 },
];
