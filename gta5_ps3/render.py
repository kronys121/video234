import sys,os,json,time
from playwright.sync_api import sync_playwright
FPS=30
def run(times,outpat,q=90):
    with sync_playwright() as p:
        b=p.chromium.launch(args=['--force-device-scale-factor=1'])
        pg=b.new_page(viewport={'width':1920,'height':1080})
        errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
        pg.goto('file:///home/claude/vid3/video.html')
        pg.evaluate("document.fonts.ready.then(()=>1)")
        pg.wait_for_function("[...document.images].filter(i=>i.getAttribute('src')).every(i=>i.complete&&i.naturalWidth>0)",timeout=20000)
        pg.wait_for_timeout(300)
        for i,t in times:
            pg.evaluate(f"render({t})")
            pg.evaluate("Promise.all(window.__p||[])")
            pg.screenshot(path=outpat%i,type='jpeg',quality=q)
        if errs: print('ERRORS',errs[:5])
        b.close()
if __name__=='__main__':
    if sys.argv[1]=='test':
        ts=[float(x) for x in sys.argv[2:]]
        os.makedirs('test',exist_ok=True)
        run([(i,t) for i,t in enumerate(ts)],'test/t%02d.jpg')
    else:
        a,b_=int(sys.argv[1]),int(sys.argv[2])
        run([(i,i/FPS) for i in range(a,b_)],'frames/f%05d.jpg')
