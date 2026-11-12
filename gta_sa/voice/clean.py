# Чистка дублей: если фраза начата заново (повтор 3+ слов в пределах ~40 слов), выкидываем ранний дубль, оставляем последний.
import json, re, sys
W = json.load(open('words_raw.json'))
nz = lambda s: re.sub(r'[^a-zа-я0-9]', '', s.lower().replace('ё', 'е'))
for i, x in enumerate(W): x['i'] = i; x['n'] = nz(x['w'])
W = [x for x in W if x['n']]
# 3-словные повторы, которые есть в самом сценарии (не трогать)
S = re.sub(r'\[.*?\]', '', open('../script_ru.txt').read().split('\n', 2)[2])
sw = [nz(w) for w in S.split() if nz(w)]
legit = set()
for a in range(len(sw) - 2):
    for b in range(a + 1, min(len(sw) - 2, a + 40)):
        if sw[a:a+3] == sw[b:b+3]: legit.add(tuple(sw[a:a+3]))
N = 3
def sim(a, b):  # мягкое совпадение слов (ошибки распознавания)
    return a == b or (len(a) > 4 and len(b) > 4 and a[:4] == b[:4])
keep = W[:]
removed = []
changed = True
while changed:
    changed = False
    for j in range(len(keep) - N + 1):
        tri = [keep[j + q]['n'] for q in range(N)]
        if tuple(tri) in legit: continue
        for k in range(max(0, j - 45), j - 1):
            if all(sim(keep[k + q]['n'], tri[q]) for q in range(N)):
                removed.append((keep[k]['t'], ' '.join(x['w'] for x in keep[k:j])))
                keep = keep[:k] + keep[j:]
                changed = True
                break
        if changed: break
json.dump([{'w': x['w'], 't': x['t'], 'e': x['e'], 'i': x['i']} for x in keep], open('words_keep.json', 'w'), ensure_ascii=False)
for t, txt in removed: print(f'{int(t//60)}:{t%60:04.1f}  УБРАНО: {txt}')
print(len(W), '->', len(keep))
