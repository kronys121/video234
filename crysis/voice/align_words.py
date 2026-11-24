# Слова озвучки Crysis с правильным текстом: сценарий (script_casual.txt) выравнивается по распознанным словам (words.json).
# Где читали не по сценарию (кусок сценария заметно длиннее/короче сказанного) — берём распознанные слова с правкой названий.
#   python3 voice/align_words.py -> voice/words_aligned.json
import json, re, difflib, os
H = os.path.dirname(os.path.abspath(__file__))
W = json.load(open(f'{H}/words.json')); toks = [x for x in open(f'{H}/../script_casual.txt').read().split() if x not in ('—', '–', '-')]
nrm = lambda x: re.sub(r'[^0-9a-zа-я]', '', x.lower().replace('ё', 'е'))
FIX = {'крайзис': 'Crysis', 'кразис': 'Crysis', 'crisis': 'Crysis', 'подтянет': 'потянет', 'крайтак': 'Crytek', 'крайтек': 'Crytek', 'край': 'Cry'}
def fix(w):
    c = nrm(w); return re.sub(r'[0-9A-Za-zА-Яа-яЁё]+', FIX[c], w, count=1) if c in FIX else w
out = []
sm = difflib.SequenceMatcher(None, [nrm(w['w']) for w in W], [nrm(x) for x in toks], autojunk=False)
for op, a1, a2, b1, b2 in sm.get_opcodes():
    if op == 'equal':
        out += [{'w': toks[b1 + k], 't': W[a1 + k]['t'], 'e': W[a1 + k]['e']} for k in range(b2 - b1)]
    elif op == 'delete' or (op == 'replace' and abs((b2 - b1) - (a2 - a1)) > 3):
        out += [{'w': fix(w['w']), 't': w['t'], 'e': w['e']} for w in W[a1:a2]]          # сказано не по сценарию
    elif op == 'replace':
        t0, t1 = W[a1]['t'], W[a2 - 1]['e']; n = b2 - b1; d = (t1 - t0) / n
        out += [{'w': toks[b1 + k], 't': t0 + k * d, 'e': t0 + (k + 1) * d} for k in range(n)]
    # insert (есть в сценарии, но не сказано) — пропускаем
# начало сказано не по сценарию: «А потянет ли Crysis?» (в сценарии «А Crysis потянет?»)
first = [w for w in W if w['t'] < 1.3]
if len(first) == 4:
    out = [{'w': x, 't': w['t'], 'e': w['e']} for x, w in zip(['«А', 'потянет', 'ли', 'Crysis?»'], first)] + [w for w in out if w['t'] >= 1.3]
json.dump(out, open(f'{H}/words_aligned.json', 'w'), ensure_ascii=False)
print('слов', len(out), 'из сценария', sum(1 for w in out if w['w'] in toks))
