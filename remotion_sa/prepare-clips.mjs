// Нарезает клипы из clips_src/*.mp4 в кадры jpg для движка.
// Если mp4 поменялся (другой размер файла), клип нарезается заново; иначе пропускается.
// ffmpeg берётся тот, что поставляется вместе с Remotion (node_modules/@remotion/compositor-…).
import fs from 'node:fs'; import path from 'node:path'; import { execFileSync } from 'node:child_process';
const NM = path.resolve('node_modules', '@remotion');
const comp = fs.readdirSync(NM).find((d) => d.startsWith('compositor-'));
if (!comp) throw new Error('не найден ffmpeg Remotion — сначала выполни npm install');
const dir = path.join(NM, comp), bin = path.join(dir, process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg');
const env = { ...process.env, LD_LIBRARY_PATH: dir, DYLD_LIBRARY_PATH: dir };
const SRC = path.resolve('clips_src'), DST = path.resolve('public', 'site', 'gta_sa', 'clips');
for (const f of fs.readdirSync(SRC).filter((x) => x.endsWith('.mp4'))) {
  const k = f.slice(0, -4), d = path.join(DST, k), stamp = path.join(d, 'source.txt');
  const sig = String(fs.statSync(path.join(SRC, f)).size);
  if (fs.existsSync(path.join(d, '0001.jpg')) && fs.existsSync(stamp) && fs.readFileSync(stamp, 'utf8') === sig) continue;
  fs.rmSync(d, { recursive: true, force: true }); fs.mkdirSync(d, { recursive: true });
  console.log('кадры клипа', k);
  execFileSync(bin, ['-y', '-v', 'error', '-i', path.join(SRC, f), '-q:v', '3', path.join(d, '%04d.jpg')], { cwd: dir, env, stdio: 'inherit' });
  fs.writeFileSync(stamp, sig);
}
console.log('клипы готовы');
