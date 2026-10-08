import sys,glob
from PIL import Image
files=sorted(glob.glob('test/t*.jpg')); cols=3; w,h=640,360
n=18
for part in range(0,len(files),n):
    fs=files[part:part+n];rows=(len(fs)+cols-1)//cols
    S=Image.new('RGB',(cols*w,rows*h),'#000')
    for i,f in enumerate(fs):
        S.paste(Image.open(f).resize((w,h)),((i%cols)*w,(i//cols)*h))
    S.save('test/sheet%d.jpg'%(part//n),quality=85)
print(len(files))
