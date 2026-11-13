import json,re
Wall=json.load(open('words_raw.json')); keep=json.load(open('words_keep.json'))
nz=lambda s: re.sub(r'[^a-zа-я0-9]','',s.lower().replace('ё','е'))
ids={x['i'] for x in keep}
ved=[i for i,x in enumerate(Wall) if nz(x['w'])=='ведущих']; a,b=ved[0],ved[1]
ax=[i for i in range(a,b) if nz(Wall[i]['w']).startswith('экс')]
for i in range(a,b):
    if not (ax[0]<=i<ax[1]): ids.add(i)
for i in range(b,b+4): ids.discard(i)
keep=[dict(w=Wall[i]['w'],t=Wall[i]['t'],e=Wall[i]['e'],i=i) for i in sorted(ids)]
S=re.sub(r'\[.*?\]','',open('../script_ru.txt').read().split('\n',2)[2]); sw=[nz(w) for w in S.split() if nz(w)]
legit=set(tuple(sw[a:a+2]) for a in range(len(sw)-1) for b in range(a+1,min(len(sw)-1,a+12)) if sw[a:a+2]==sw[b:b+2])
legit|={('в','вайсите'),('что','то')}
ch=True;rem=[]
while ch:
    ch=False; n=[nz(x['w']) for x in keep]
    for j in range(len(keep)-1):
        if (n[j],n[j+1]) in legit or not n[j]: continue
        for k in range(max(0,j-10),j-1):
            if n[k]==n[j] and n[k+1]==n[j+1]:
                rem.append((keep[k]['t'],' '.join(x['w'] for x in keep[k:j]))); keep=keep[:k]+keep[j:]; ch=True; break
        if ch: break
for t,s in rem: print(f'{int(t//60)}:{t%60:04.1f}  УБРАНО: {s}')
json.dump(keep,open('words_keep.json','w'),ensure_ascii=False); print(len(keep))
